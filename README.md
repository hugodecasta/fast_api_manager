# fast_api_manager
Console manager for auto_api and fast_auth systems

### system description

The fast_api_manager console prompter is a tool to manage your auth data. The manager automate the creation and management of the auth data relative to the [auto_api](https://github.com/hugodecasta/auto_api) specification. It uses to the [fast_auth](https://github.com/hugodecasta/fast_auth) system to store all auth data (key and token)

### executing

When executing the console prompter, one must give the auth data directory path

`node <fast_api_manager/dir/path> <auth_data/dir/path>`

example

`node ./fast_api_manager ../my_data/auth_data`

### procedures

When opening the prompter, you will be asked to enter a `"USER ID"`. This id ensure that not all person having access to the manager can manage your secret keys and tokens. This id user id is used to access a specific file (encrypted by the storage system) in which key list and meta data (usefull for the manager) are stored.

` USER ID: <your secret user id>`

The prompter uses a multi-layer management system. It allows you to access these specific layers:
  * **key list management**
    - list all keys name
    - generate new key
    - **specific key management**
      - list apis right
      - set apis right
      - remove apis right
      - check key meta data
      - activate the key
      - deactivate the key
      - get key infos (name, etc.)
      - set name (sn)
      - remove the key
      - **specific token management**
        - check token string
        - check token data
        - execute a "pay api" procedure
        - revoke the roken (delete it)
        
At each stage, one can use the `> help` command to see all current commands
        
### examples

In order to be demonstrative, here is some common use cases of the manage:

  * when one wants to create a new key and create an infinit api access on the say_jokes api
    * `> USER ID: admin` enter your user id
    * `> gk` generate a new key
    * `key name > my_free_user` enter the "key name"
    * `KEY : my_free_user > apis` to see all api rights
    * `...no apis`
    * `KEY : my_free_user > set api` to set an api right
    * `...api name ? say_jokes` set api name
    * `...life (number) ? 1` set the api life for this key's tokens
    * `...price (number) ? 0` set a 0 price to create an infinitly living token
    * `KEY : my_free_user > apis` recheck rights
    * `   say_jokes : { life: 1, price: 0 }`
    * `KEY : my_free_user > infos` check key info
    * `...key : my_free_userddb7dc78-69df-4539-b445-8ad9bca2184badmin`
    * `...name : my_free_user`
    * `...desc : -- no desc --`
    
    
