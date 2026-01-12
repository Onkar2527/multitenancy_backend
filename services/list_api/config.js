exports.config = {
    mode: process.env.ENVIROMENT,
    production: {
        database_config: {
            user: 'root',
            database_type: "mysql",
            host: "localhost",
            port: "",
            database_name: "list_cbs_masters",
            ispass: true,
            password: 'fco@kredpool'
        },
        api: {
            host: "http://10.128.117.5",
            port: "9999",
            logs: true,
            routes: [
                { name: 'jwtToken', url: '/CustomerInfo/api/auth/getJwt', operation: 'get' },
                { name: 'masters', url: '/MasterLOV/customer/getMasterLOV/', operation: 'get' },
                { name: 'getCustomer', url: '/CustomerInfo/customer/getCustomerInfo?', operation: 'get' },
                { name: 'onBoard', url: '/OnBoardCustomer/customer/onBoard', operation: 'post' }
            ],
            isproxy: false
        }
    },
    local: {
        database_config: {
            user: 'root',
            database_type: "mysql",
            host: "localhost",
            port: "",
            database_name: "list_cbs_masters",
            ispass: true,
            password: 'No.5670@'
        },
        api: {
            host: "http://103.42.162.39",
            port: "8888",
            logs: true,
            routes: [
                { name: 'jwtToken', url: '/CustomerInfo/api/auth/getJwt', operation: 'get' },
                { name: 'masters', url: '/MasterLOV/customer/getMasterLOV/', operation: 'get' },
                { name: 'getCustomer', url: '/CustomerInfo/customer/getCustomerInfo?', operation: 'get' },
                { name: 'onBoard', url: '/OnBoardCustomer/customer/onBoard', operation: 'post' }
            ],
            isproxy: true
        }
    },
    testing_server: {
        database_config: {
            user: 'root',
            database_type: "mysql",
            host: "20.197.10.226",
            port: "3306",
            database_name: "list_cbs_masters_ajara",
            ispass: true,
            password: 'Kred@Pool123'
        },
        api: {
            host: "http://103.42.162.39",
            port: "8085",
            logs: true,
            routes: [
                { name: 'jwtToken', url: '/CustomerInfo/api/auth/getJwt', operation: 'get' },
                { name: 'masters', url: '/MasterLOV/customer/getMasterLOV/', operation: 'get' },
                { name: 'getCustomer', url: '/CustomerInfo/customer/getCustomerInfo?', operation: 'get' },
                { name: 'onBoard', url: '/OnBoardCustomer/customer/onBoard', operation: 'post' }
            ],
            isproxy: false
        }
    }
}