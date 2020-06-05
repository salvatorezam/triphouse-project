exports.config = {
    connectionLimit: 10,
    host: 'localhost',
    // Non usiamo *** mai *** root senza password
    user: 'adminTH',
    password: 'Unipa2020',
    database: 'TripHouse_DB',
    multipleStatements: true // consente query multiple in un'unica istruzione SQL
}