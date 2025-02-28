VERSION = "1.01";

bg = chrome.extension.getBackgroundPage();
HTMLCollection.prototype.forEach = Array.prototype.forEach;
var status_quota;

var actions = {
    create_target: function () {
        bg.create_target();
    },
    select_inputs: function (host) {
        bg.select_inputs(host);
    },
    highlight_inputs: function (host) {
        bg.highlight_inputs(host);
    },
    load_wordlist: function (host) {
        bg.open_dict_window(host);
    },
    set_interval: function (host, interval) {
        bg.set_interval(host, interval);
    },
    set_offset: function (host, offset) {
        bg.set_offset(host, offset);
    },
    start_brute: function (host) {
        bg.start_brute(host);
    },
    pause_brute: function (host) {
        bg.pause_brute(host);
    },
    delete_brute: function (host) {
        bg.delete_brute(host);
    },
};

function isEmpty(obj) {
    for (var i in obj) return false;

    return true;
}

var Row = function (domain) {
    this.domain = domain;
    this.sec;
    this.num;
    this.creds_count;
    this.username;
    this.password;
    this.actions = {
        inputs: false,
        wordlist: false,
        start: false,
        pause: false,
        delete: false,
        create: true,
    };
    this.is_done = false;
    this.is_founded = false;
    this.status_ = status_quota;

    this.element = document.createElement("div");
    this.element.setAttribute("class", "content-area");
    this.element.setAttribute("host", domain);
    this.element.innerHTML =
        `
        <div>` +
        domain +
        `</div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    `;

    this.set_sec = function () {
        if (this.sec != null) {
            if (
                !this.element.children[1].children.length ||
                this.element.children[1].children[0].getAttribute("value") !=
                    this.sec
            )
                this.element.children[1].innerHTML =
                    '<input action="set_interval" host="' +
                    this.domain +
                    '" value="' +
                    this.sec +
                    '">';
        } else this.element.children[1].innerHTML = "N/A";
    };
    this.set_num = function () {
        if (this.num != null) {
            if (
                !this.element.children[2].children.length ||
                this.element.children[2].children[0].getAttribute("value") !=
                    this.num
            )
                this.element.children[2].innerHTML =
                    '<input action="set_offset" host="' +
                    this.domain +
                    '" value="' +
                    this.num +
                    '"><span>/' +
                    this.creds_count +
                    "</span>";
        } else this.element.children[2].innerHTML = "N/A";
    };
    this.set_username = function () {
        if (this.username)
            this.element.children[3].innerHTML = '"' + this.username + '"';
        else this.element.children[3].innerHTML = "N/A";
    };
    this.set_password = function () {
        if (this.password)
            this.element.children[4].innerHTML = '"' + this.password + '"';
        else this.element.children[4].innerHTML = "N/A";
    };

    this.set_actions = function () {
        if (this.actions.inputs) {
            if (
                !this.element.children[5].children.length ||
                this.element.children[5].children[0].getAttribute("action") !=
                    "select_inputs"
            )
                this.element.children[5].innerHTML =
                    '<i class="fa-solid fa-arrow-pointer" action="select_inputs" host="' +
                    this.domain +
                    '"></i>';
        } else this.element.children[5].innerHTML = "N/A";

        if (this.actions.wordlist) {
            if (
                !this.element.children[6].children.length ||
                this.element.children[6].children[0].getAttribute("action") !=
                    "load_wordlist"
            )
                this.element.children[6].innerHTML =
                    '<i class="fa-solid fa-spell-check" action="load_wordlist" host="' +
                    this.domain +
                    '"></i>';
        } else this.element.children[6].innerHTML = "N/A";

        if (this.actions.start) {
            if (
                !this.element.children[7].children.length ||
                this.element.children[7].children[0].getAttribute("action") !=
                    "start_brute"
            )
                this.element.children[7].innerHTML =
                    '<i class="fa-solid fa-play" action="start_brute" host="' +
                    this.domain +
                    '"></i>';
        } else if (this.actions.pause) {
            if (
                !this.element.children[7].children.length ||
                this.element.children[7].children[0].getAttribute("action") !=
                    "pause_brute"
            )
                this.element.children[7].innerHTML =
                    '<i class="fa-solid fa-pause" action="pause_brute" host="' +
                    this.domain +
                    '"></i>';
        } else this.element.children[7].innerHTML = "N/A";

        if (this.actions.delete) {
            if (
                !this.element.children[8].children.length ||
                this.element.children[8].children[0].getAttribute("action") !=
                    "delete_brute"
            )
                this.element.children[8].innerHTML =
                    '<i class="fa-solid fa-trash-xmark" action="delete_brute" host="' +
                    this.domain +
                    '"></i>';
        } else if (this.actions.create) {
            if (
                !this.element.children[8].children.length ||
                this.element.children[8].children[0].getAttribute("action") !=
                    "create_target"
            )
                this.element.children[8].innerHTML =
                    '<i class="fa-solid fa-plus" action="create_target"></i>';
        } else this.element.children[8].innerHTML = "N/A";

        if (this.status_) {
            if (!this.element.children[9].children.length)
                this.element.children[9].innerHTML = status_quota;
        } else this.element.children[9].innerHTML = "N/A";
    };

    this.update_handlers = function () {
        var items = this.element.getElementsByTagName("i"),
            inputs = this.element.getElementsByTagName("input");

        for (var i = 0; i < items.length; i++)
            if (!items[i].was_hooked) {
                items[i].addEventListener(
                    "click",
                    (function (callback, host) {
                        return function () {
                            callback(host);
                        };
                    })(
                        actions[items[i].getAttribute("action")],
                        items[i].getAttribute("host")
                    )
                );

                if (items[i].getAttribute("action") == "select_inputs")
                    items[i].addEventListener(
                        "mouseover",
                        (function (callback, host) {
                            return function () {
                                callback(host);
                            };
                        })(
                            actions.highlight_inputs,
                            items[i].getAttribute("host")
                        )
                    );
                items[i].was_hooked = true;
            }

        for (var i = 0; i < inputs.length; i++)
            if (!inputs[i].was_hooked) {
                inputs[i].addEventListener(
                    "change",
                    (function (callback, host) {
                        return function (e) {
                            callback(host, e.target.value);
                        };
                    })(
                        actions[inputs[i].getAttribute("action")],
                        inputs[i].getAttribute("host")
                    )
                );
                inputs[i].was_hooked = true;
            }
    };

    this.update = function () {
        this.set_sec();
        this.set_num();
        this.set_username();
        this.set_password();
        this.set_actions();

        if (this.is_done)
            this.element.children.forEach(function (td) {
                status_quota = "Done";
            });
        else
            this.element.children.forEach(function (td) {
                status_quota = "Waiting";
            });

        if (this.is_founded)
            this.element.children.forEach(function (td) {
                status_quota = "Found";
            });

        this.update_handlers();
    };
};

var Rows = function (parent_element) {
    var element = document.createElement("div"),
        rows = [];

    element.setAttribute("class", "content");

    parent_element.appendChild(element);
    element.innerHTML = `
        <div class="content-header">
            <div>Domain</div>
            <div>Seconds</div>
            <div>Attempt(s)</div>
            <div>Username</div>
            <div>Password</div>
            <div>Select</div>
            <div>Wordlist</div>
            <div>Start/Pause</div>
            <div>Add/Remove</div>
			<div>Status</div>
        </div>
    `;

    //element.appendChild( document.createElement('div') )
    //element = element.getElementsByTagName('div')[0]

    this.find = function (domain) {
        for (var i = 0; i < rows.length; i++)
            if (rows[i].domain == domain) return rows[i];
    };
    this.add = function (row) {
        element.appendChild(row.element);
        rows.push(row);
        row.update();
    };
    this.delete = function (row) {
        for (var i = 0; i < rows.length; i++)
            if (rows[i].domain == row.domain) {
                element.removeChild(row.element);
                rows.splice(i, 1);
            }
    };
    this.forEach = function (callback) {
        for (var i = 0; i < rows.length; i++) callback(rows[i], i, rows);
    };
};

var rows;

function create_stat() {
    var current_target = bg.targets.get_current_target(),
        current_tab = bg.tabs.get_current_tab(),
        row,
        creds;

    bg.targets.forEach(function (target) {
        row = new Row(target.host);
        creds = target.settings.dictionary.get_current_creds();
        if (!target.status.is_attack) {
            row.sec = target.settings.brute_interval;
            row.num = target.settings.dictionary.get_wordlists().length
                ? target.settings.dictionary.offset
                : null;
            row.username = creds.user;
            row.password = creds.password;
            row.actions = {
                inputs: true,
                wordlist: true,
                start: target.settings.dictionary.get_wordlists().length
                    ? true
                    : false,
                pause: false,
                delete: true,
                create: false,
            };
        } else {
            if (creds.user == null && creds.password == null) {
                row.sec = null;
                row.num = null;
                row.username = null;
                row.password = null;
                row.is_done = true;
                row.actions = {
                    inputs: false,
                    wordlist: false,
                    start: false,
                    pause: false,
                    delete: true,
                    create: false,
                };
            } else {
                row.sec = target.settings.brute_interval;
                row.num = target.settings.dictionary.offset;
                row.username = creds.user;
                row.password = creds.password;
                row.actions = {
                    inputs: false,
                    wordlist: false,
                    start: false,
                    pause: true,
                    delete: false,
                    create: false,
                };
            }
        }
        if (target.founded.length) {
            row.username = target.founded[0].user;
            row.password = target.founded[0].password;
            row.is_founded = true;
        }
        row.creds_count = target.settings.dictionary.get_count();
        rows.add(row);
    });

    if (!current_target && current_tab && !bg.targets.find(current_tab.host)) {
        row = new Row(current_tab.host);
        row.actions = {
            inputs: false,
            wordlist: false,
            start: false,
            pause: false,
            delete: false,
            create: true,
        };
        rows.add(row);
    }
}

function update_stat() {
    var row,
        creds,
        domains_active = [];
    bg.targets.forEach(function (target) {
        domains_active.push(target.host);
        if (!(row = rows.find(target.host))) row = new Row(target.host);
        creds = target.settings.dictionary.get_current_creds();
        if (!target.status.is_attack) {
            row.sec = target.settings.brute_interval;
            row.num = target.settings.dictionary.get_wordlists().length
                ? target.settings.dictionary.offset
                : null;
            row.username = creds.user;
            row.password = creds.password;
            row.actions = {
                inputs: true,
                wordlist: true,
                start: target.settings.dictionary.get_wordlists().length
                    ? true
                    : false,
                pause: false,
                delete: true,
                create: false,
            };
        } else {
            if (creds.user == null && creds.password == null) {
                row.sec = null;
                row.num = null;
                row.username = null;
                row.password = null;
                row.is_done = true;
                row.actions = {
                    inputs: false,
                    wordlist: false,
                    start: false,
                    pause: false,
                    delete: true,
                    create: false,
                };
            } else {
                row.sec = target.settings.brute_interval;
                row.num = target.settings.dictionary.offset;
                row.username = creds.user;
                row.password = creds.password;
                row.actions = {
                    inputs: false,
                    wordlist: false,
                    start: false,
                    pause: true,
                    delete: false,
                    create: false,
                };
            }
        }
        if (target.founded.length) {
            row.username = target.founded[0].user;
            row.password = target.founded[0].password;
            row.is_founded = true;
        }
        row.creds_count = target.settings.dictionary.get_count();
        if (!rows.find(row.domain)) rows.add(row);
        else row.update();
    });

    rows.forEach(function (row) {
        if (
            domains_active.indexOf(row.domain) == -1 &&
            row.actions.create == false
        )
            rows.delete(row);
    });
}

document.addEventListener(
    "DOMContentLoaded",
    function () {
        try {
            document
                .querySelector("#pathname")
                .append(window.location.pathname);

            rows = new Rows(document.getElementById("stat"));
            create_stat();
            setInterval(update_stat, 500);
        } catch (e) {
            console.warn(
                "Errors here are usually not important, please ignore."
            );
            console.error(e);
        }
    },
    false
);
