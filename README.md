# app-first-model

该项目集成了用户侧+审核侧的客户端项目，支持在mac和windows系统中运行，可以使用不同的打包命令生成想要的客户端项目

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ yarn

# 如果出现electron安装不上的问题，在命令后面增加unsafe-perm
yarn add electron --unsafe-perm=true
```

### Development

```bash
# 本地运行: 审核端
$ yarn dev

# 本地运行: 用户端
$ yarn dev:user
```

### Build（执行build命令后版本号会自动递增，版本号管理在.env中，打包配置修改在build.js中）

```bash
# 打包: win-线上环境-审核端
$ yarn build:win:prod:admin

# 打包: win-线上环境-用户端
$ yarn build:win:prod:user

# 打包: win-测试环境-审核端
$ yarn build:win:test:admin

# 打包: win-测试环境-用户端
$ yarn build:win:test:user

```
