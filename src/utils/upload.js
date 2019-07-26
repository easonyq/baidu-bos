/**
 * @file 上传文件的实际处理方法
 * @author wangyisheng@baidu.com (wangyisheng)
 */
/* istanbul ignore file */

import path from 'path'
import mime from 'mime'
import fs from 'fs-extra'
import sdk from '@baiducloud/sdk'
import log from './log'

let client

export async function upload ({ak, sk, endpoint, files, bucket, prefix, options} = {}) {
  if (!client) {
    client = new sdk.BosClient({
      credentials: {ak, sk},
      endpoint
    })
  }

  // Single upload
  if (files.length === 1) {
    let objectName = getObjectName(files[0], prefix);
    await uploadInner(files[0], bucket, objectName, endpoint, options)
    return
  }

  // Batch upload
  // 最多同时上传5个文件
  let freeNum = 5
  let execUploadTask = () => {
    if (files.length !== 0) {
      let file = files.pop()
      let objectName = getObjectName(file, prefix);
      uploadInner(file, bucket, objectName, endpoint, options).then(execUploadTask, execUploadTask)
    }
  }
  // 启动任务
  while (freeNum !== 0 && files.length !== 0) {
    freeNum--
    execUploadTask()
  }
}

/**
 * 获取上传文件的实际远程路径，如：
 * baidu-bos lib/bos.js bos://assets/static/my-bos.js => /static/my-bos.js (重命名)
 * baidu-bos lib/bos.js bos://assets/static => /static/lib/bos.js (拼接)
 *
 * @param {string} file 文件名
 * @param {?string} prefix 上传 URL 除去 bucket 的部分。如 bos://assets/some/path 时 prefix = some/path
 * @returns 实际远程路径
 */
function getObjectName (file, prefix) {
  let objectName
  if (!prefix) {
    objectName = `/${file}`
  } else {
    let extName = path.extname(file)
    if (extName && extName === path.extname(prefix)) {
      // baidu-bos lib/bos.js bos://assets/static/my-bos.js => static/my-bos.js
      // 以 prefix 为准，相当于重命名
      objectName = `/${prefix}`
    } else {
      // baidu-bos lib/bos.js bos://assets/static => static/lib/bos.js
      // 路径对两者进行拼接
      objectName = `/${prefix}/${file}`
    }
  }

  // 避免拼接时出现连续 / 的情况
  return objectName.replace(/\/+/g, '/')
}

function getHeader(defaultHeader = {}, headerConfig, option) {
  let headerConfigs = headerConfig.split(',')
  for (let i = 0; i < headerConfigs.length; i++) {
    switch (headerConfigs[i]) {
      case 'nocache':
        defaultHeader['Cache-Control'] = 'max-age=0, nocache'
        break
      case 'download':
        defaultHeader['Content-Disposition'] = `attachment; filename="${path.basename(option.objectName)}"`
        break
    }
  }
  return defaultHeader;
}

async function uploadInner (file, bucket, objectName, endpoint, options) {
  let data = fs.readFileSync(file)

  try {
    let defaultHeader = {'Content-Type': mime.getType(objectName) || 'application/octet-stream'}
    let header = options.headerConfig ? getHeader(defaultHeader, options.headerConfig, {objectName}) : defaultHeader
    await client.putObject(bucket, objectName, data, header)
  } catch (e) {
    log.error('文件上传失败：' + file)
    console.log(e)
    return
  }

  let bosUrl = endpoint + '/' + bucket + objectName;
  log.info('url: \t' + bosUrl);
}
