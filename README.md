# Vault Sync Tool

The Vault Sync tool or VST is for generating and syncing vault policies, groups and appRoles.

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/m4FvBQ)

<!-- toc -->
* [Vault Sync Tool](#vault-sync-tool)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Building the Docker image

`podman build . -t vsync`

## Environment Variables

The tool can use the following environment variables in place of command arguments. The default is in the brackets. The defaults are for testing with a local Vault instance.

* VAULT_ADDR - The address of the vault server ('http://127.0.0.1:8200')
* VAULT_TOKEN - The token to use when connecting to vault (myroot)

To set the environment variables, source the target environment's setenv-*.sh file. For example, to set the address and token for the dev environment, run the following command:

`source setenv-dev.sh`

You will need vault and jq installed to run the above.

## Supported npm commands

* npm start - deploy configuration to provided vault instance
* npm run lint - lint source code
* npm run test - Run unit tests
* npm run e2e - Run end-to-end tests

## Configuration

See: [Confluence Documentation](https://apps.nrs.gov.bc.ca/int/confluence/x/m4FvBQ)

## Local testing

The following will start up vault in docker. The Vault Sync Tool defaults for the address and token should work with it.

`podman run --rm -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' --name=dev-vault -p 8200:8200 vault`

You will need to add an OIDC authentication method to do local testing of group syncs.

```
source setenv-local.sh
vault auth enable oidc
vault auth enable -path=vs_apps_approle approle
vault secrets enable -path=apps -version=2 kv
```

# Usage
<!-- usage -->
```sh-session
$ npm install -g vstool
$ vstool COMMAND
running command...
$ vstool (--version)
vstool/1.0.0 darwin-arm64 node-v22.1.0
$ vstool --help [COMMAND]
USAGE
  $ vstool COMMAND
...
```
<!-- usagestop -->

The script /bin/dev can run the code without installing it.

```sh-session
$ ./bin/dev COMMAND
running command...
$ ./bin/dev (-v|--version|version)
...
```

# Commands
<!-- commands -->
* [`vstool approle-sync`](#vstool-approle-sync)
* [`vstool find`](#vstool-find)
* [`vstool group-sync`](#vstool-group-sync)
* [`vstool health`](#vstool-health)
* [`vstool help [COMMAND]`](#vstool-help-command)
* [`vstool init`](#vstool-init)
* [`vstool monitor`](#vstool-monitor)
* [`vstool plugins`](#vstool-plugins)
* [`vstool plugins:add PLUGIN`](#vstool-pluginsadd-plugin)
* [`vstool plugins:inspect PLUGIN...`](#vstool-pluginsinspect-plugin)
* [`vstool plugins:install PLUGIN`](#vstool-pluginsinstall-plugin)
* [`vstool plugins:link PATH`](#vstool-pluginslink-path)
* [`vstool plugins:remove [PLUGIN]`](#vstool-pluginsremove-plugin)
* [`vstool plugins:reset`](#vstool-pluginsreset)
* [`vstool plugins:uninstall [PLUGIN]`](#vstool-pluginsuninstall-plugin)
* [`vstool plugins:unlink [PLUGIN]`](#vstool-pluginsunlink-plugin)
* [`vstool plugins:update`](#vstool-pluginsupdate)
* [`vstool policy-sync`](#vstool-policy-sync)

## `vstool approle-sync`

Syncs approles in Vault

```
USAGE
  $ vstool approle-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Syncs approles in Vault
```

## `vstool find`

Find Vault creds

```
USAGE
  $ vstool find [-h] [--vault-token <value>] [--vault-addr <value>]

FLAGS
  -h, --help                 Show CLI help.
      --vault-addr=<value>   [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>  [default: myroot] The vault token

DESCRIPTION
  Find Vault creds
```

## `vstool group-sync`

Syncs external groups in Vault to connect roles with Vault policies

```
USAGE
  $ vstool group-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Syncs external groups in Vault to connect roles with Vault policies
```

## `vstool health`

Display Vault health

```
USAGE
  $ vstool health [-h] [--vault-token <value>] [--vault-addr <value>]

FLAGS
  -h, --help                 Show CLI help.
      --vault-addr=<value>   [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>  [default: myroot] The vault token

DESCRIPTION
  Display Vault health
```

## `vstool help [COMMAND]`

Display help for vstool.

```
USAGE
  $ vstool help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for vstool.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.0/src/commands/help.ts)_

## `vstool init`

Initialize a Vault instance and save root token and unseal keys.

```
USAGE
  $ vstool init [-h] [--secret-shares <value>] [--secret-threshold <value>] [--vault-token <value>]
    [--vault-addr <value>]

FLAGS
  -h, --help                      Show CLI help.
      --secret-shares=<value>     [default: 1] The number of shares to split the master key into
      --secret-threshold=<value>  [default: 1] The number of shares required to reconstruct the master key
      --vault-addr=<value>        [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>       [default: myroot] The vault token

DESCRIPTION
  Initialize a Vault instance and save root token and unseal keys.
```

## `vstool monitor`

Monitor for changes to sync to vault

```
USAGE
  $ vstool monitor [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>] [--root <value>...]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --root=<value>...         [default: ] The root to constrict the policy sync to. Some roots can be further
                                constricted such as -root=apps -root=cool-app-war
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Monitor for changes to sync to vault
```

## `vstool plugins`

List installed plugins.

```
USAGE
  $ vstool plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ vstool plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.2.3/src/commands/plugins/index.ts)_

## `vstool plugins:add PLUGIN`

Installs a plugin into vstool.

```
USAGE
  $ vstool plugins:add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into vstool.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VSTOOL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VSTOOL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ vstool plugins:add

EXAMPLES
  Install a plugin from npm registry.

    $ vstool plugins:add myplugin

  Install a plugin from a github url.

    $ vstool plugins:add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ vstool plugins:add someuser/someplugin
```

## `vstool plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ vstool plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ vstool plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.2.3/src/commands/plugins/inspect.ts)_

## `vstool plugins:install PLUGIN`

Installs a plugin into vstool.

```
USAGE
  $ vstool plugins:install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into vstool.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the VSTOOL_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the VSTOOL_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ vstool plugins:add

EXAMPLES
  Install a plugin from npm registry.

    $ vstool plugins:install myplugin

  Install a plugin from a github url.

    $ vstool plugins:install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ vstool plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.2.3/src/commands/plugins/install.ts)_

## `vstool plugins:link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ vstool plugins:link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ vstool plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.2.3/src/commands/plugins/link.ts)_

## `vstool plugins:remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vstool plugins:remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vstool plugins:unlink
  $ vstool plugins:remove

EXAMPLES
  $ vstool plugins:remove myplugin
```

## `vstool plugins:reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ vstool plugins:reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.2.3/src/commands/plugins/reset.ts)_

## `vstool plugins:uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vstool plugins:uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vstool plugins:unlink
  $ vstool plugins:remove

EXAMPLES
  $ vstool plugins:uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.2.3/src/commands/plugins/uninstall.ts)_

## `vstool plugins:unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ vstool plugins:unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ vstool plugins:unlink
  $ vstool plugins:remove

EXAMPLES
  $ vstool plugins:unlink myplugin
```

## `vstool plugins:update`

Update installed plugins.

```
USAGE
  $ vstool plugins:update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.2.3/src/commands/plugins/update.ts)_

## `vstool policy-sync`

Syncs policies to Vault

```
USAGE
  $ vstool policy-sync [-h] [--broker-api-url <value>] [--broker-token <value>] [--vault-token <value>]
    [--vault-addr <value>] [--root <value>...]

FLAGS
  -h, --help                    Show CLI help.
      --broker-api-url=<value>  [default: https://nr-broker.apps.silver.devops.gov.bc.ca/] The broker api base url
      --broker-token=<value>    The broker JWT
      --root=<value>...         [default: ] The root to constrict the policy sync to. Some roots can be further
                                constricted such as -root=apps -root=cool-app-war
      --vault-addr=<value>      [default: http://127.0.0.1:8200] The vault address
      --vault-token=<value>     [default: myroot] The vault token

DESCRIPTION
  Syncs policies to Vault
```
<!-- commandsstop -->
