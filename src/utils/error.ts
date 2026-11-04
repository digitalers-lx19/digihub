export const error = {
    log: (err: Error) => console.error(`error: `, err.message) ?? true,
    close: (err: Error) => error.log(err) && process.exit(1),
    xml: (err:Error) => error.log(err) && `
        <error>
            <title>${err.name}</title>
            <text>${err.message}</title>
        </error>`,
    
}