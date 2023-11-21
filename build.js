const fs = require('fs');
const dotenv = require('dotenv')
const env = dotenv.config('.env').parsed;
const args = process.argv.slice(2);
const currentType = args[0] // 当前客户端类型
const currentEnv = args[1] // 当前环境
const isTest = (currentEnv === 'dev') || (currentEnv === 'test')

const stage = 10
const inc = 1 // 递增值
function newV(version) {
  // 版本号是字符串，所以要做一个转数字处理
  let arr = version.split('.').map((x) => +x)
  // 从最后一位计算自增，所以 i--
  for (let i = arr.length - 1; i >= 0; i--) {
    // 每一节数字大于设定的值 并且 不是第一位，给前一位进 1；
    if (arr[i] + 1 >= stage && i > 0) {
      arr[i] = 0 // 当前位从 0 计数
    } else {
      arr[i] += inc
      break // 结束循环
    }
  }
  return arr.join('.')
}

const config = {
  name: 'app-first-model-user',
  productName: '1号模型网',
  url: 'https://s.1haomoxing.cn/updater/new_user_client/'
}
switch (currentType) {
  case 'admin':
    config.name = 'app-first-model-admin'
    config.productName = "1号模型网 管理侧"
    if (isTest) {
      config.url = "https://s.1haomoxing.cn/updater/new_admin_client/"
    } else {
      config.url = "https://s.1haomoxing.com/updater/new_admin_client/"
    }
    break;

  case 'user':
    config.name = 'app-first-model-user'
    config.productName = "1号模型网"
    if (isTest) {
      config.url = "https://s.1haomoxing.cn/updater/new_user_client/"
    } else {
      config.url = "https://s.1haomoxing.com/updater/new_user_client/"
    }
    break;

  default:
    break;
}
// 读取.env文件
fs.readFile('.env', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const envList = [
    `RENDERER_VITE_ALL_APP_TYPE=${currentType} # admin:审核端 user:用户端`,
    `RENDERER_VITE_ALL_UPDATE_URL=${config.url}`,
    `testUserVersion=${(currentType === 'user' && currentEnv === 'test') ? newV(env.testUserVersion) : env.testUserVersion}`,
    `testAdminVersion=${(currentType === 'admin' && currentEnv === 'test') ? newV(env.testAdminVersion) : env.testAdminVersion}`,
    `prodUserVersion=${(currentType === 'user' && currentEnv === 'prod') ? newV(env.prodUserVersion) : env.prodUserVersion}`,
    `prodAdminVersion=${(currentType === 'admin' && currentEnv === 'prod') ? newV(env.prodAdminVersion) : env.prodAdminVersion}`,
  ]
  // 将读取的内容解析为JSON对象
  const envs = envList.join('\n')

  // 将修改后的内容写入.env文件
  fs.writeFile('.env', envs, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('.env配置已成功修改');
  });
});
// 读取package.json文件
fs.readFile('package.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // 将读取的内容解析为JSON对象
  const packageJson = JSON.parse(data); 

  // 修改配置
  if (currentEnv === 'test') {
    packageJson.version = newV(currentType === 'user' ? env.testUserVersion : env.testAdminVersion)
  } else if (currentEnv === 'prod') {
    packageJson.version = newV(currentType === 'user' ? env.prodUserVersion : env.prodAdminVersion)
  }
  packageJson.name = `${config.name}-${currentEnv}`
  packageJson.build = {
    ...packageJson.build,
    "win": {
      "target": [
        "nsis"
      ],
      "icon": "build/icons/icon.ico",
      "requestedExecutionLevel": "highestAvailable" // 打开自动请求使用管理员权限
    },
    "nsis": {
      "oneClick": false,
      "language": "2052",
      "perMachine": true,
      "allowToChangeInstallationDirectory": true
    },
    "extraResources": [
      "Script/**" // 将根目录下Script下所有文件打包到应用程序中,会放到/resources文件夹下,用于将.ds文件拖入max软件中的必备脚本
    ],
    "productName": isTest ? `测试版-${config.productName}` : `${config.productName}`,
    "publish": [
      {
        "provider": "generic",
        "url": config.url // 更新url
      }
    ]
  };

  // 将修改后的JSON对象转换为字符串
  const modifiedPackageJson = JSON.stringify(packageJson, null, 2);

  // 将修改后的内容写入package.json文件
  fs.writeFile('package.json', modifiedPackageJson, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('package.json配置已成功修改');
  });
});