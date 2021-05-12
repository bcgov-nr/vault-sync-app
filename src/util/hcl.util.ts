import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import {injectable} from 'inversify';

export interface HlcRenderSpec {
  group: string;
  templateName: string;
  data?: ejs.Data | undefined;
}

@injectable()
/**
 * Utility class for HCL
 */
export default class HclUtil {
  private static templatesdir = path.join(__dirname, '..', 'vault', 'templates');

  /**
   * Renders a body from the template
   * @param spec The information to use to render the body
   */
  public renderBody(spec: HlcRenderSpec) {
    const pathArray = [HclUtil.templatesdir, spec.group, `${spec.templateName}.hcl.tpl`]
      .filter((s): s is string => s != undefined);
    const filePath = path.join(...pathArray);
    return ejs.render(
      fs.readFileSync(filePath, 'UTF8'),
      {
        ...spec.data,
      },
    );
  }

  /**
   * Renders a name from the template if it exists or parameters
   * @param spec The information to use to render the body
   */
  public renderName(spec: HlcRenderSpec) {
    const pathArray = [HclUtil.templatesdir, spec.group, `${spec.templateName}.name.tpl`]
      .filter((s): s is string => s != undefined);
    const filePath = path.join(...pathArray);
    if (fs.existsSync(filePath)) {
      return `${spec.group}/${ejs.render(
        fs.readFileSync(filePath, 'UTF8'),
        {
          ...spec.data,
        },
      )}`;
    } else {
      return spec.group ? `${spec.group}/${spec.templateName}` : spec.templateName;
    }
  }
}
