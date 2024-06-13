/**
 * This script reads HCL files from a specified directory, combines their contents
 * and generates a single OpenShift ConfigMap YAML file.
 *
 * Usage:
 *   node hcl-to-configmap.js -d /path/to/directory -n configmap-name -ns namespace
 *
 * Options:
 *   -d, --directory  Path to the directory containing HCL files
 *   -n, --name       Name of the ConfigMap
 *   -ns, --namespace Namespace for the ConfigMap
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('yaml');
const yargs = require('yargs');

const argv = yargs
  .usage('Usage: $0 -d [directory] -n [name] -ns [namespace]')
  .option('directory', {
    alias: 'd',
    description: 'Path to the directory containing HCL files',
    type: 'string',
    demandOption: true
  })
  .option('name', {
    alias: 'n',
    description: 'Name of the ConfigMap',
    type: 'string',
    demandOption: true
  })
  .option('namespace', {
    alias: 'ns',
    description: 'Namespace for the ConfigMap',
    type: 'string',
    demandOption: true
  })
  .help()
  .alias('help', 'h')
  .argv;

const directoryPath = path.resolve(argv.directory);
const configMapName = argv.name;
const namespace = argv.namespace;

async function createConfigMap() {
  try {
    const files = await fs.readdir(directoryPath);
    const hclFiles = files.filter(file => file.endsWith('.hcl.tpl'));

    let data = {};

    for (const hclFile of hclFiles) {
      const filePath = path.join(directoryPath, hclFile);
      const hclContent = await fs.readFile(filePath, 'utf8');
      data[hclFile] = hclContent.trim();
    }

    const configMap = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: configMapName,
        namespace: namespace,
      },
      data,
    };

    const outputFilePath = path.join(directoryPath, `${configMapName}-configmap.yaml`);
    await fs.writeFile(outputFilePath, yaml.stringify(configMap));

    console.log(`ConfigMap YAML file created successfully at ${outputFilePath}`);
  } catch (error) {
    console.error('Error creating ConfigMap:', error);
  }
}

createConfigMap();
