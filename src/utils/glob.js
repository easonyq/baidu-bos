/**
 * @file 把 glob 封装成 Promise
 * @author wangyisheng@baidu.com (wangyisheng)
 */
/* istanbul ignore file */

import glob from 'glob'

export default function (pattern, options) {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      resolve(files)
    })
  })
}

export function hasMagic (pattern, options) {
  return glob.hasMagic(pattern, options)
}
