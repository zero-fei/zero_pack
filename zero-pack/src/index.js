#! /usr/bin/env node
const path = require('path')
const fs = require('fs')

// 默认配置
const defaultConfig = {
  entry: './src/indxe.js',
  output: {
    filename: 'bundle.js'
  }
}

// 最终配置
const config = {...defaultConfig, ...require(path.resolve('./zero.config.js'))} 

class Pack {
  constructor(config) {
    this.config = config
    this.entry = config.entry
    // 工作 根目录
    this.root = process.cwd()
  }
  parse(code, parent) {
    // 解析require('xxx.js')
    let deps = []
    let r = /require\('(.*)'\)/g
    // require('xxx.js')替换为 __pack_require__
    code = code.replace(r, function(match, arg) { 
        const retPath = path.join(parent, arg.replace(/'|"/g), '')
        deps.push(retPath)
        return `__pack_require__("./${retPath}")`
    })
    return { 
      code,
      deps
    }
  }
  createModule(modulePath, name) {
    const fileContent = fs.readFileSync(modulePath, 'utf-8')
    // 替换后的代码和依赖数组
    const { code, deps } = this.parse(fileContent,  path.dirname(name))
    console.info(code, deps)
  }
  start() {
    console.info('开始解析文件依赖')
    // 拿到入口
    const entryPath = path.resolve(this.root, this.entry)
    this.createModule(entryPath, this.entry)
  }
}

const _pack = new Pack(config)
_pack.start()