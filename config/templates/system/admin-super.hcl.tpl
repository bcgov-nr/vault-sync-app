# Super-admin policy
# Scope: All super admins - Should not be used except for recovery

path "*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# No access to user secrets except your own!
path "user/*" {
  capabilities = []
}

<% kvPaths.forEach(function(secretKvPath){ %>
path "<%= secretKvPath %>/config" {
  capabilities = ["read", "update"]
}
<% }); %>
