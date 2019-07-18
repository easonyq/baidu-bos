/**
 * @file 上传命令 baidu-bos <file> <url>
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import fs from 'fs-extra'
import log from '../utils/log'
import {getConfig} from '../utils/config'
import glob from '../utils/glob'
import {hasMagic} from '../utils/glob'
import {upload} from '../utils/upload'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20M

export function uploadHelp () {
  console.log('  Examples:\n')
  console.log('    baidu-bos file path\t\t\t上传一个文件')
  console.log('    baidu-bos file1 file2 file3... path\t上传多个文件')
  console.log('    baidu-bos minimatch path\t\t使用通配符上传文件')
  console.log('')
  console.log('    path 的格式为: bos://<bucket>/some/path')
}

// Usage:
// baidu-bos file path
// baidu-bos file1 file2 file3... path
// baidu-bos minimatch path
// 上传命令并不带有 command 参数，因此写法和 config 略有区别。
export async function uploadCommand (file, moreFilesAndPath) {
  if (!moreFilesAndPath || moreFilesAndPath.length === 0) {
    log.error('未知的上传 URL，请重试')
    return
  }

  // 获取 ak, sk, endpoint
  let {
    'bos.ak': ak,
    'bos.sk': sk,
    'bos.endpoint': endpoint
  } = getConfig()
  if (!ak || !sk || !endpoint) {
    log.error('请先设置 bos.ak, bos.sk, bos.endpoint')
    log.error('你可以在百度云存储官网获得更多信息')
    return
  }

  // 整理 files 数组和 uploadPath
  let files = [file]
  let uploadPath = moreFilesAndPath[moreFilesAndPath.length - 1]
  for (let i = 0; i < moreFilesAndPath.length - 1; i++) {
    files.push(moreFilesAndPath[i])
  }
  files = await getFiles(files)
  if (files.length === 0) {
    log.error('没有待上传的文件，请重试')
    return
  }

  // 验证 uploadPath 合法性，并分离出 bucket 和 target
  let uploadReg = /^bos:\/\/([^\/]+)(.*)?$/
  let uploadMatch = uploadPath.match(uploadReg)
  if (!uploadMatch) {
    log.error('错误的上传 URL：' + uploadPath)
    return
  }

  let bucket = uploadMatch[1]
  let prefix = (uploadMatch[2] || '').replace(/^\/+/, '')

  await upload({ak, sk, endpoint, files, bucket, prefix})
  // var sdk = new bos.BaiduObjectStorage(ak, sk, endpoint, maxSize, autoUri);
  // return sdk.upload(bucket, file, target);
}

async function getFiles(files) {
  let set = new Set()

  // 通过 glob 获取所有原始文件
  await Promise.all(files.map(file => {
    // . => **
    if (file === '.') {
      file = '**'
    }
    // src/ => src/**
    if (file.charAt(file.length - 1) === '/') {
      file += '**'
    }

    // src(no magic) => src/**
    if (!hasMagic(file)) {
      let stat = fs.statSync(file)
      if (stat.isDirectory()) {
        file = (file + '/**').replace(/\/+/, '/')
      }
    }

    return glob(file, {nodir: true}).then(tmpFiles => {
      tmpFiles.forEach(file => set.add(file))
    })
  }))

  // 逐个检测文件是否存在
  let results = []
  set.forEach(file => {
    if (fs.pathExistsSync(file)) {
      let stat = fs.statSync(file)
      if (stat.size <= MAX_FILE_SIZE) {
        results.push(file)
      } else {
        log.warn('文件大小超过限制 (20M) ，已自动跳过：' + file)
      }
    } else {
      log.warn('文件不存在，已自动跳过：' + file)
    }
  })

  return results
}
