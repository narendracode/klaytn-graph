export type ConnectionConfig = {
    client: string,
    connection: {
        host: string,
        port: number,
        database: string,
        user: string,
        password: string
    }
}