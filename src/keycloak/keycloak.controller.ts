// eslint-disable-next-line no-unused-vars
import KeycloakAdminClient from 'keycloak-admin';

/**
 * Keycloak controller.
 */
export class KeycloakController {
  /**
  * Constructor. Accepts a keycloak admin client, and log & error to enable this.log/this.error.
  */
  constructor(
    private keycloak: KeycloakAdminClient,
    private log: Function,
    private error: Function) {}

  /**
   * Find or create a group in Keycloak.
   */
  public async syncGroup(groupname: string) {
    await this.findGroupInKeycloak(groupname)
      .then(async (group) => {
        if (group) {
          this.log(`Group ${groupname} already exists in Keycloak.`);
          return group.id;
        } else {
          await this.createGroupInKeycloak(groupname);
        }
      });
  }

  /**
   * Find an entry in an array with a name field that matches a given name key.
   */
  search(nameKey: string, array: Array<any>) {
    for (let i=0; i < array.length; i++) {
      if (array[i].name === nameKey) {
        return array[i];
      }
    }
  }

  /**
   * Find a group in Keycloak.
   */
  async findGroupInKeycloak(groupname: string) {
    const groups = await this.keycloak.groups.find();
    const group = this.search(groupname, groups);
    if (!group) return false;
    return group;
  }

  /**
   * Create a group in Keycloak.
   */
  async createGroupInKeycloak(groupname: string) {
    this.keycloak.groups.create({name: groupname})
      .then((group) => {
        this.log(`Group ${groupname} created in Keycloak.`);
        return group.id;
      })
      .catch((error: any) => {
        return this.error(`Error creating group '${groupname}' in Keycloak: Error ${error.response.statusCode}!`);
      });
  }
}
