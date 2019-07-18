/**
 * 获取项目根目录
 *
 * @return {string} 目录 Path
 */
/* istanbul ignore file */

import os from 'os'
import path from 'path'
import fs from 'fs-extra'

export function getHome () {
  let dir = path.resolve(process.env[os.platform() === 'win32' ? 'APPDATA' : 'HOME'], '.baidu-bos');
  fs.ensureDirSync(dir)

  return dir;
}
