## Crud Client

Command line client for Bluzelle DB

### Quick Start

* download the executable from the /dist directory for your OS
* ./crud-console-[os] --host=xxx.xxx.xxx.xxx --port=xxxxx --uuid=my-uuid`

### Example Session

```
scott$ ./crud-console-macos --uuid=scott
 
 crud-client (test.network.bluzelle.com:51010/scott)
 TYPE "help" for a list of commands
 
 > connect
 undefined
 > keys
 []
 > create foo 'some string'
 undefined
 > keys
 [ 'foo' ]
 > read foo
 some string
 > update foo no-space-string
 undefined
 > read foo
 no-space-string
 > remove foo
 undefined
 > keys
 []
 > 
```