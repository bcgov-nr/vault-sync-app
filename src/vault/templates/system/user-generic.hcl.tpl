# Adobe/cryptr support
# Scope: All users

path "sys/policy/*" {
    policy = "read"
}

# Grant permissions on user specific path
path "user/data/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}
path "user/data/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}/*" {
    capabilities = [ "create", "update", "read", "delete", "list" ]
}

# For Web UI usage of user specific path
path "user/metadata" {
  capabilities = ["list"]
}
path "user/metadata/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}" {
  capabilities = ["create", "update","read","list", "delete"]
}
path "user/metadata/{{identity.entity.aliases.<%= global_oidc_accessor %>.name}}/*" {
  capabilities = ["create", "update","read","list", "delete"]
}
