baidu-bos
=========

[![npm (scoped with tag)](https://img.shields.io/npm/v/baidu-bos.svg)](https://npmjs.com/package/baidu-bos)
[![Build Status](https://api.travis-ci.org/easonyq/baidu-bos.svg?branch=master)](https://travis-ci.org/easonyq/baidu-bos)
[![Coverage Status](https://coveralls.io/repos/github/easonyq/baidu-bos/badge.svg?branch=master)](https://coveralls.io/github/easonyq/baidu-bos)

## 项目背景

将静态资源上传到 BOS (Baidu Object Storage，一个由百度云服务提供的 CDN 存储)

本项目的目的主要有 2 个：

1. 原命令 `edp bos` 在开发中颇为方便，但随着 `edp` 本身的消亡，现在为了使用 `edp bos` 不得不安装 `edp` 是本末倒置的；如果你不想改变习惯了的命令参数格式，可以尝试使用 `baidu-bos`，它的参数格式和 `edp bos` 完全相同。

2. 原命令 `edp bos` 对通配符的支持相当有限，基本上只支持 `.` 表示当前目录的所有文件，无法支持例如 `package` 开头的文件，目录中包含子目录的所有文件，文件和目录同时上传等需求。`baidu-bos` 扩展了通配符的支持，且语法和主流类库相同。

## 安装

```bash
npm i baidu-bos -g
```

## 重要提示

1. 如果您是初次使用，请先使用 `baidu-bos config set` 命令配置 bos.ak, bos.sk 和 bos.endpoint。具体取值可以咨询百度云服务
2. 如果您是从 `edp bos` 迁移而来，请使用 `baidu-bos config import-from-edp` 命令直接从 edp 导入配置，可以省去分别设置的麻烦
3. 设置 bos.endpoint 时**必须**加上协议头，例如 `http://bos.nj.bpc.baidu.com`，否则可能会有网络连接的错误出现

## 上传文件

* 普通上传

  使用本地的文件路径和文件名，拼接在 CDN 路径之后

  ```bash
  baidu-bos dir/a.js bos://<bucket>/path
  # 目标地址：<bucket>/path/dir/a.js
  ```

* 指定 CDN 地址

  无视本地的文件路径和文件名，指定 CDN 上的远程路径和文件名

  ```bash
  baidu-bos dir/b.js bos://<bucket>/path/b-2.js
  # 目标地址：<bucket>/path/b-2.js
  ```

* 使用通配符 (minimatch)

  使用通配符 ([minimatch](https://github.com/isaacs/minimatch) 和 [glob](https://github.com/isaacs/node-glob)) 匹配多个文件

  ```bash
  baidu-bos dir/**/*.js bos://<bucket>/path
  # 上传所有 dir 目录(包括子目录) 下的 js 文件。目标 URL 维持原有的层级结构

  baidu-bos pack* bos://<bucket>/path
  # 上传当前目录所有 pack 开头的文件
  ```

* 上传当前目录下所有文件 (快捷操作)

  将当前目录下 (包含子目录) 的所有文件上传。按照通配符的写法应当是 `**`，但为了简便，您可以直接写 `.`，效果等价。

  ```bash
  baidu-bos . bos://<bucket>
  # 等价于 baidu-bos ** bos://<bucket>
  ```

* 上传目录 (快捷操作)

  上传目录时，按照通配符的写法应当是 `src/**`，但为了简便，您可以省略 `**`，直接使用 `src/`。

  特别地，如果目录参数 __不包含__ 通配符，则可以省略最后的 `/`，直接使用 `src`。

  ```bash
  baidu-bos dir bos://<bucket>/dir
  # 等价于 baidu-bos dir/** bos://<bucket>

  baidu-bos user*/static/ bos://<bucket>/dir
  # 等价于 baidu-bos user*/static/** bos://<bucket>/dir
  # 此时 static 后面的 / 不能省略！
  ```

* 混合使用

  上述目录参数均可以空格为间隔，混合使用。

  ```bash
  baidu-bos dir/a.js dir/b.js dir-2 bos://<bucket>
  # 分别上传 dir/a.js, dir/b.js 和 dir-2 目录（及子目录）的全部内容
  ```

输出形如:

```bash
baidu-bos INFO url:     http://bos.nj.bpc.baidu.com/<bucket>/a.js
```

## 配置相关

在首次使用时，您可能需要配置 bos.ak, bos.sk 和 bos.endpoint。此外，您也可能会在使用过程中切换/修改某个配置项，可以使用 `baidu-bos config` 命令。

* 写入配置

  可初次写入 / 覆盖某项配置

  ```bash
  baidu-bos config set [key] [value]
  # 如 baidu-bos config set bos.ak 12345
  ```

* 读取配置

  ```bash
  baidu-bos config get [key]
  # 如 baidu-bos config get bos.ak
  ```

* 列出所有配置

  ```bash
  baidu-bos config list
  ```

* 删除一项配置

  ```bash
  baidu-bos config remove [key]
  # 如 baidu-bos config remove bos.ak
  ```

* 删除全部配置

  ```bash
  baidu-bos config remove-all
  ```

* 从 edp 导入配置

  ```bash
  baidu-bos config import-from-edp
  # 根据 edp config 的输出内容获取 bos.ak, bos.sk, bos.endpoint 并直接写入
  ```
