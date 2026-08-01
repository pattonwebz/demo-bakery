import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

/**
 * child_process's sync spawn blocks this process's event loop until the child
 * exits — which would starve the HTTP server below of the ability to answer
 * requests from the scan's own headless Chrome. Use the async form and await it.
 */
function run( command, args, env ) {
	return new Promise( ( resolve ) => {
		const child = spawn( command, args, { cwd: root, env, stdio: "inherit" } );
		child.on( "exit", ( code ) => resolve( code ?? 0 ) );
	} );
}

// Local, no-cost equivalent of .github/workflows/deploy-and-scan.yml's `accessibility`
// job: serve site/ instead of a real GitHub Pages deploy, then run the *actual*
// axe-scan-action and axe-report-action code (installed as normal git devDependencies,
// dist/ already built and committed in both) as plain Node scripts driven by INPUT_*
// env vars — the same way the Actions runner invokes them. No GitHub Actions runtime,
// no CI minutes, same report as CI produces.
const root = dirname( dirname( fileURLToPath( import.meta.url ) ) );
const siteDir = join( root, "site" );
const port = Number( process.env.PORT ?? 8899 );

const MIME = {
	".html": "text/html; charset=utf-8",
	".css": "text/css",
	".js": "application/javascript",
	".svg": "image/svg+xml",
	".png": "image/png",
	".ico": "image/x-icon",
};

const server = createServer( async ( req, res ) => {
	try {
		const urlPath = ( req.url ?? "/" ).split( "?" )[ 0 ];
		const filePath = join( siteDir, urlPath === "/" ? "/index.html" : urlPath );
		const data = await readFile( filePath );
		res.writeHead( 200, { "Content-Type": MIME[ extname( filePath ) ] ?? "application/octet-stream" } );
		res.end( data );
	} catch {
		res.writeHead( 404 );
		res.end( "Not found" );
	}
} );

await new Promise( ( resolve ) => server.listen( port, "127.0.0.1", resolve ) );
const base = `http://127.0.0.1:${ port }/`;
console.log( `Serving site/ at ${ base }` );

let exitCode = 0;
try {
	const artifactsDir = join( root, "artifacts" );
	mkdirSync( artifactsDir, { recursive: true } );
	const resultsFile = join( artifactsDir, "axe-results.json" );
	const summaryFile = join( artifactsDir, "a11y-summary.md" );
	writeFileSync( summaryFile, "" );

	console.log( "\n--- Scanning with axe-scan-action ---" );
	const scanEntry = join( root, "node_modules", "axe-scan-action", "dist", "index.js" );
	const scanEnv = {
		...process.env,
		"INPUT_URLS": JSON.stringify(
			readdirSync( join( root, "site" ) )
				.filter( ( file ) => file.endsWith( ".html" ) )
				.sort()
				.map( ( file ) => `${ base }${ file }` )
		),
		"INPUT_OUTPUT-FILE": resultsFile,
	};
	await run( "node", [ scanEntry ], scanEnv );

	console.log( "\n--- Reporting with axe-report-action ---" );
	const reportEntry = join( root, "node_modules", "axe-report-action", "dist", "index.js" );
	const reportEnv = {
		...process.env,
		"INPUT_RESULTS-FILE": resultsFile,
		"INPUT_FAIL-ON": process.env.FAIL_ON ?? "serious",
		"INPUT_SHOW-PERSONAS": process.env.SHOW_PERSONAS ?? "true",
		GITHUB_STEP_SUMMARY: summaryFile,
	};
	exitCode = await run( "node", [ reportEntry ], reportEnv );

	console.log( `\nWrote ${ resultsFile }` );
	console.log( `Wrote ${ summaryFile }` );
} finally {
	server.close();
}

process.exitCode = exitCode;
