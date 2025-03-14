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
        return queryResult[0] as T[];
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}