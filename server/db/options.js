exports.options = {
    host: 'localhost',
    //port: 3306,
    //port: '/var/run/mysqld/mysqld.sock',
    user: 'adminTH',
    password: 'Unipa2020',
    database: 'TripHouse_DB',
    createDatabaseTable: true,
    schema: {
        tableName: 'USERS_SESSIONS',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};