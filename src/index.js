/**
 * @file 实际文件入口
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import commander from 'commander'
import checkUpdate from './utils/checkUpdate'
import log from './utils/log'
import {uploadHelp, uploadCommand} from './commands/upload'
import registerConfig from './commands/config'

import packageInfo from '../package.json'
let version = packageInfo.version

checkUpdate().then(() => {
  if (!process.argv[2]) {
    console.log('未知的命令，请执行 baidu-bos -h 查看命令列表')
    return
  }

  let argv = process.argv[2];

  if (argv === '-v' || argv === '--version') {
    // show baidu-bos version
    log.info('version: ', version);
  }

  // define command
  commander
    .usage('<file> [moreFilesAndPath...]')
    .arguments('<file> [moreFilesAndPath...]')
    .option('-v, --version', '查看当前版本')
    .on('--help', uploadHelp)
    .action(async (file, moreFilesAndPath) => {
      await uploadCommand(file, moreFilesAndPath)
    });

  registerConfig(commander);

  commander.parse(process.argv);
})
