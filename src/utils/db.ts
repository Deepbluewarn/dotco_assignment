import mysql, { PoolConnection } from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'bluewarn',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dotco_db',
    waitForConnections: true,
    connectionLimit: 10,
});

// 커넥션 해제를 보장하는 withConnection 헬퍼
export async function withConnection<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
    const connection = await pool.getConnection();
    try {
        return await callback(connection);
    } finally {
        connection.release(); // 항상 연결 해제
    }
}

export async function executeQuery<T>(query: string, params?: any[]): Promise<T> {
    return withConnection(async (connection) => {
        const [rows] = await connection.execute(query, params || []);
        return rows as T;
    });
}

// New function to handle transactions
export async function withTransaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T> {
    return withConnection(async (connection) => {
        await connection.beginTransaction();
        try {
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        }
    });
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