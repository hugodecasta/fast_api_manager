// ---------------------------------------------- REQUIRES

const FastAuth = require('fast_auth')
const Storage = require('storage')
const rl = require('readline-sync')
const colors = require('colors')

// ---------------------------------------------- VARS

const auth_data_dir = process.argv[2] || './auth_data'
const key_data_storage = new Storage(auth_data_dir+'/manager_data')
const fastauth = new FastAuth(auth_data_dir)

var user_id = null
var current_info = null

// ---------------------------------------------- CORE

// ------ user_data

function get_key_data() {
    if(!key_data_storage.key_exists(user_id+'data')) {
        set_key_data({})
    }
    return key_data_storage.read_key(user_id+'data')
}

function set_key_data(data) {
    return key_data_storage.write_key(user_id+'data',data)
}

function save_key_info(infos) {
    let keys = get_key_data()
    keys[infos.name] = infos
    return set_key_data(keys)
}

function delete_key_info(infos) {
    let keys = get_key_data()
    delete keys[infos.name]
    return set_key_data(keys)
}

function get_infos(name) {
    let keys = get_key_data()
    return keys[name]
}

// ------ key

function create_new_key(name) {
    fastauth.prefix = name
    fastauth.suffix = user_id.split(':')[0]
    let key = fastauth.create_key({})
    let infos = {key,name,desc:'-- no desc --'}
    save_key_info(infos)
}

// ------ current

function remove_key() {
    fastauth.remove_key(current_info.key)
    delete_key_info(current_info)
}

// ---------------------------------------------- PROMPT SYS

function create_commands(commands,alias) {

    let has_alias = {}
    
    for(let ali in alias) {
        has_alias[alias[ali]] = ali
        commands[ali] = commands[alias[ali]]
    }

    commands.help = function() {
        console.log('commands:')
        for(let comm in commands) {
            if(comm in alias) {
                continue
            }
            let str = comm.cyan
            if(comm in has_alias) {
                str += (' ('+has_alias[comm]+')').gray
            }
            console.log('   >',str)
        }
    }

    return commands
}

// ---------------------------------------------- PROMPT

function manage_token() {

    function token() {
        let date = new Date()
        date.setHours(23,50,00,00)
        return fastauth.get_token(current_info.key,date.getTime())
    }

    if(token() == null) {
        console.log('key is deactivated - token generation impossible'.red)
        return
    }

    let commands = create_commands({
        'token':function() {
            console.log(token().green)
        },
        'data':function() {
            let data = fastauth.get_token_data(token()).data()
            for(let api in data) {
                console.log('   '+api,':',data[api])
            }
            if(Object.keys(data).length == 0) {
                console.log('   no data')
            }
        },
        'pay api': function() {
            let api_name = rl.question('    api name ? ')
            let token_data = fastauth.get_token_data(token())
            let api_data = token_data.get_data(api_name)
            if(api_data == undefined) {
                console.log('api not found !'.red)
                return
            }
            api_data.life = api_data.life - api_data.price
            token_data.set_data(api_name,api_data)
            console.log('api payed !'.green)
        },
        'revoke':function() {
            fastauth.revoke_token(token())
            end = true
        },
        'exit':function() {end=true},
    },{
        't':'token',
        'd':'data',
        'pa':'pay api',
        'r':'revoke',
    })

    let end = false
    while(!end) {
        let comm = rl.question('TOKEN : '+current_info.name+' > ')
        if(comm in commands) {
            commands[comm]()
        } else {
            console.log('command not found !'.red)
        }
    }
}

function enter_name(name) {

    current_info = get_infos(name)
    let commands = create_commands({
        'apis':function() {
            let data = fastauth.get_key_data(current_info.key,true).data()
            for(let api in data) {
                console.log('   '+api,':',data[api])
            }
            if(Object.keys(data).length == 0) {
                console.log('   no apis')
            }
        },
        'meta':function() {
            let meta = fastauth.get_key_data(current_info.key,true).meta()
            for(let inf in meta) {
                console.log('   '+inf,':',meta[inf])
            }
        },
        'set api': function() {
            let api = rl.question('    api name ? ')
            let life = parseInt(rl.question('    life (number) ? '))
            let price = parseInt(rl.question('    price (number) ? '))
            let key_data = fastauth.get_key_data(current_info.key,true)
            key_data.set_data(api,{life,price})
        },
        'remove api':function() {
            let api = rl.question('    api name ? ')
            let key_data = fastauth.get_key_data(current_info.key,true)
            key_data.set_data(api,undefined)
        },
        'activate': function() {
            let key_data = fastauth.get_key_data(current_info.key,true)
            key_data.set_meta('active',true)
            console.log('key activated')
        },
        'deactivate': function() {
            let key_data = fastauth.get_key_data(current_info.key,true)
            key_data.set_meta('active',false)
            console.log('key de-activated')
        },
        'infos':function() {
            let key = current_info.key
            let name = current_info.name
            let desc = current_info.desc
            console.log('   key'.yellow,':',key.green)
            console.log('   name'.yellow,':',name.green)
            console.log('   desc'.yellow,':',desc.green)
        },
        'set name':function() {
            let name = rl.question('new key name > ')
            delete_key_info(current_info)
            current_info.name = name
            save_key_info(current_info)
        },
        'remove':function() {
            let resp = null
            while(resp != 'n' || resp != 'y') {
                resp = rl.question('remove key '+current_info.name+' ? (y/n) ')
                if(resp == 'y') {
                    remove_key()
                    end = true
                    break
                } else if(resp == 'n') {
                    break
                }
            }
        },
        'token': manage_token,
        'exit':function() {end=true},
    },{
        'a':'apis',
        'sa':'set api',
        'ra':'remove api',
        'm':'meta',
        'aa':'activate',
        'da':'deactivate',
        'i':'infos',
        'sn':'set name',
        'rm':'remove',
        't':'token'
    })

    let end = false
    while(!end) {
        let comm = rl.question('KEY : '+current_info.name+' > ')
        if(comm in commands) {
            commands[comm]()
        } else {
            console.log('command not found !'.red)
        }
    }
}

async function manage_key() {

    let name = rl.question('key name > ')
    if(get_infos(name) != null) {
        enter_name(name)
    } else {
        console.log('key name not found'.red)
    }

}
 
function main() {

    while(user_id == null) {
        user_id = rl.question(' - USER ID: ')
    }

    let commands = create_commands({
        'keys':function() {
            let keys = get_key_data()
            for(let name in keys) {
                console.log('   '+name)
            }
        },
        'generate key':function() {
            let name = rl.question('key name > ')
            create_new_key(name)
            enter_name(name)
        },
        'manage key':manage_key,
        'exit':function() { process.exit(0) },
    },{
        'mk':'manage key',
        'gk':'generate key',
        'k':'keys'
    })

    while(true) {
        let comm = rl.question('> ')
        if(comm == '') {
            continue
        } else if(comm in commands) {
            commands[comm]()
        } else {
            console.log('command not found'.red)
        }
    }

}

main()