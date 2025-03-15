import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'bluewarn',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dotco_db',
    waitForConnections: true,
    connectionLimit: 10,
});

export async function executeQuery<T = any>(sql: string, params: any[] = []) {
    try {
        const queryResult = await pool.execute(sql, params);
        return queryResult[0] as T;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

// New function to handle transactions
export async function withTransaction<T>(
    callback: (connection: mysql.Connection) => Promise<T>
): Promise<T> {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Helper to execute query with a specific connection
export async function executeWithConnection<T = any>(
    connection: mysql.Connection,
    sql: string,
    params: any[] = []
): Promise<T> {
    const [rows] = await connection.execute(sql, params);
    return rows as T;
}