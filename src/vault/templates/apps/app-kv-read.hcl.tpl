# Read policy for application
# Scope: Approle

<% if (appCanReadProject) { %>
path "apps/metadata/<%= environment %>/<%= project %>/shared" {
  capabilities = ["read", "list"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/shared" {
  capabilities = ["read", "list"]
}
<% } %>

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["read"]
}

path "<%= secertKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>" {
  capabilities = ["read", "list"]
}

path "<%= secertKvPath %>/data/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["read"]
}

path "<%= secertKvPath %>/metadata/<%= environment %>/<%= project %>/<%= application %>/+" {
  capabilities = ["read", "list"]
}
