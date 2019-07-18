/**
 * @file 设置命令 baidu-bos config
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {getConfig, setConfig, removeConfig, importConfig} from '../utils/config'
import log from '../utils/log'

function setConfigCommand (key, value) {
  setConfig(key, value)
}

function getConfigCommand (key) {
  let value = getConfig(key)
  log.info(`${key} = ${value}`)
}

function listConfigCommand () {
  let allConfig = getConfig()
  Object.keys(allConfig).forEach(key => {
    log.info(`${key} = ${allConfig[key]}`)
  })
}

function removeConfigCommand (key) {
  removeConfig(key)
}

function removeAllConfigCommand () {
  removeConfig()
}

function importFromEDPCommand () {
  importConfig('edp')
}

export default function (commander) {
  commander
    .command('config <cmd> [others...]')
    .usage('<cmd> [others...]')
    .description('设置/获取/列出配置项')
    .on('--help', () => {
      console.log('  Examples:\n')
      console.log('    baidu-bos config set [key] [value]\t设置一项配置')
      console.log('    baidu-bos config get [key]\t\t查看一项配置')
      console.log('    baidu-bos config remove [key]\t删除一项配置')
      console.log('    baidu-bos config remove-all\t\t删除所有配置')
      console.log('    baidu-bos config list\t\t查看所有配置')
      console.log('    baidu-bos config import-from-edp\t从 edp 导入配置')
    })
    .action((cmd, others) => {
      if (cmd === 'list') {
        listConfigCommand()
      } else if (cmd === 'remove-all') {
        removeAllConfigCommand()
      } else if (cmd === 'get') {
        if (!others || others.length === 0) {
          log.error('baidu-bos config get 命令至少需要一个参数，请重试')
          return
        }

        getConfigCommand(others[0])
      } else if (cmd === 'remove') {
        if (!others || others.length === 0) {
          log.error('baidu-bos config remove 命令至少需要一个参数，请重试')
          return
        }

        removeConfigCommand(others[0])
      } else if (cmd === 'set') {
        if (!others || others.length < 2) {
          log.error('baidu-bos config set 命令至少需要两个参数，请重试')
          return
        }

        setConfigCommand(others[0], others[1])
      } else if (cmd === 'import-from-edp') {
        importFromEDPCommand()
      } else {
        log.error('未知的命令，请执行 baidu-bos config -h 查看命令列表')
      }
    })
}
