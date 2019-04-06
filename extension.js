const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const Soup = imports.gi.Soup;

let text, button;

function _hideStatus() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showStatus() {
    log("hello");
    //the library to work with http request
    let URL = 'https://ucp.nordvpn.com/api/v1/helpers/ips/insights';
    let _httpSession = new Soup.Session();
    let message = Soup.form_request_new_from_hash('GET', URL, {});
    // execute the request and define the callback
    _httpSession.queue_message(
        message,
        Lang.bind(
            this,
            function (_httpSession, message) {
                if (message.status_code !== 200) {
                    log("STATUS:" + message.status_code);
                    return;
                }
                let json = JSON.parse(message.response_body.data);
                let content = json.protected ? "protected" : "unprotected";

                if (!text) {
                    text = new St.Label({});
                    Main.uiGroup.add_actor(text);
                }
                    text.text = content;
                    text.style_class = content;
                text.opacity = 255;
                let monitor = Main.layoutManager.primaryMonitor;
                text.set_position(monitor.x + Math.floor(monitor.width / 4 - text.width),
                                  monitor.y + Math.floor(monitor.height / 4 - text.height));
                Tweener.addTween(
                    text,
                    {
                        opacity: 0,
                        time: 4,
                        transition: 'easeOutQuad',
                        onComplete: _hideStatus
                    });
            })
    );
}

function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', _showStatus);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
