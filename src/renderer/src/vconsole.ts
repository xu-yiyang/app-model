// import './style.css';
import VConsole from 'vconsole'

export const vconsole = function (routesConfig: any[], history: any) {
  try {
    // 路由后面不能带参数
    var currentRouter = location?.href?.match?.(/^.+(\/.*)$/)?.[1];
    var vConsole = new VConsole({
      // 可以在此设定要默认加载的面板, 这里删除了默认的element
      defaultPlugins: ['element', 'system', 'network', 'storage']
    });
    var myPlugin = new VConsole.VConsolePlugin('route_jump', 'Route Jump');
    myPlugin.on('init', function () {
      console.warn('Route Jump vconsole init');
    });
    myPlugin.on('renderTab', function (callback: (arg0: HTMLOListElement) => void) {
      var olNode = document.createElement('ol');
      var text = '';

      for (var i = 0; i < routesConfig.length; i++) {
        if (currentRouter === routesConfig[i].path) {
          text += `<li class='s-current-url' style="padding: 10px; text-decoration: underline">`.concat(routesConfig[i].path, `</li>`);
        } else {
          text += `<li style="padding: 10px; text-decoration: underline">`.concat(routesConfig[i].path, `</li>`);
        }
      }

      olNode.innerHTML = text;
      olNode.style.margin = '0';
      olNode.addEventListener('click', function (event: any) {
        if (event.target.tagName.toLowerCase() === 'li') {
          var urlNode = routesConfig.find(function (item) {
            return item.path === event.target.innerText;
          });
          history ? history.replace(urlNode.path) : window.location.hash = urlNode.path;
        }
      }, false);
      var myEvent = new CustomEvent('urlHashChange');
      olNode.addEventListener('urlHashChange', function () {
        ;
        [].forEach.call(olNode.children, function (item: any) {
          if (item.innerText !== window.location.hash.slice(1)) {
            item.classList.remove('s-current-url');
          } else {
            item.classList.add('s-current-url');
          }
        });
      }); // hash路由时

      window.addEventListener('hashchange', function () {
        if (window.location.hash) {
          olNode.dispatchEvent(myEvent);
        }
      });
      callback(olNode);
    });
    myPlugin.on('addTool', function (callback: (arg0: { name: string; onClick: () => void; }[]) => void) {
      var button = {
        name: 'Reload(仅限hashHistory)',
        onClick: function onClick() {
          window.location.reload();
        }
      };
      callback([button]);
    });
    vConsole.addPlugin(myPlugin);
  } catch (error) {
    console.error('vConsoleMfun_error: ', error);
  }
};