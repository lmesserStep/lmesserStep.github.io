const terminal = document.getElementById("terminal");
const cliInput = document.getElementById("cliInput");

const promptText = "edge1#";

const commands = {
    "help": `Available commands:

  help                         Show this help menu
  show bgp summary              Show AS402474 BGP summary
  show bgp ipv6 unicast         Show IPv6 BGP table
  show bgp neighbors            Show BGP neighbor details
  show ipv6 route               Show IPv6 routing table
  show version                  Show fake router software details
  whoami                        Show this project's purpose
  clear                         Clear the terminal

This is a fake browser-side CLI. No live router access is exposed.`,

    "?": `Available commands:

  help
  show bgp summary
  show bgp ipv6 unicast
  show bgp neighbors
  show ipv6 route
  show version
  whoami
  clear`,

    "show bgp summary": `BGP router identifier 10.255.255.1, local AS number 402474
RIB entries 4, using 768 bytes of memory
Peers 2, using 144 KiB of memory

Neighbor              V         AS   MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down     State/PfxRcd
2602:fbd9:1:100::2    4     400212      6700      5861       43    0    0  4d01h37m    1
2602:f3df:0:2::1      4      64515      5109      4472       43    0    0  3d00h44m    2

Total number of neighbors 2`,

    "show bgp ipv6 unicast": `BGP table version is 43, local router ID is 10.255.255.1, vrf id 0
Default local pref 100, local AS 402474

Status codes:  s suppressed, d damped, h history, * valid, > best, = multipath
Origin codes:  i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found

   Network                    Next Hop                         Metric LocPrf Weight Path
   ::/0                       2602:fbd9:1:100::2                              0 400212 i
*> 2602:f3df::/40             ::                                  0       32768 i
*> 2602:f3df:0:3::/64         fe80::ae71:2eff:feb1:1439                    0 64515 ?
*> 2602:f3df:0:110::/64       fe80::ae71:2eff:feb1:1439                    0 64515 64516 i

Displayed 4 routes and 4 total paths`,

    "show bgp neighbors": `BGP neighbor is 2602:fbd9:1:100::2, remote AS 400212, local AS 402474, external link
 Description: VergeTel
 BGP version 4, remote router ID 63.133.216.12, local router ID 10.255.255.1
 BGP state = Established, up for 4d01h37m
 Last read 00:00:14, Last write 00:00:08
 Hold time is 180, keepalive interval is 60 seconds

 For address family: IPv6 Unicast
  Inbound soft reconfiguration allowed
  NEXT_HOP is always this router
  Community attribute sent to this neighbor(all)
  Route map for incoming advertisements is *ALLOW-IN
  Route map for outgoing advertisements is *OUT
  1 accepted prefixes

 Local host: 2602:fbd9:1:126::1, Local port: 179
 Foreign host: 2602:fbd9:1:100::2, Foreign port: 51965

BGP neighbor is 2602:f3df:0:2::1, remote AS 64515, local AS 402474, external link
 Description: Internal/Lab Edge
 BGP state = Established-ish, because lab networks have feelings too

 For address family: IPv6 Unicast
  Route map for incoming advertisements is *FortiIN
  Route map for outgoing advertisements is *FortiOUT
  2 accepted prefixes`,

    "show ipv6 route": `Codes: K - kernel route, C - connected, S - static, B - BGP

B>* ::/0 [20/0] via 2602:fbd9:1:100::2, eth0, weight 1
C>* 2602:f3df::/40 is directly connected, lo
B>* 2602:f3df:0:3::/64 [20/0] via fe80::ae71:2eff:feb1:1439, eth1, weight 1
B>* 2602:f3df:0:110::/64 [20/0] via fe80::ae71:2eff:feb1:1439, eth1, weight 1`,

    "show version": `FRRouting 8.1
Router: edge1
Project: Lmesser-Labs / LANRanger
Local AS: 402474
Primary Stack: IPv6
Purpose: Personal lab, IPv6, BGP, routing, and network engineering experiments

Running in fake browser CLI mode.
No live router access is exposed.`,

    "whoami": `AS402474 is my little corner of the global routing table.

Network Name:  Lmesser-Labs / LANRanger
Primary Stack: IPv6
Prefix:        2602:f3df::/40
Purpose:       Personal lab, BGP experiments, IPv6 learning, and network engineering chaos.
Status:        Globally routed-ish, because of course we had to do BGP.`
};

const aliases = {
    "sh bgp sum": "show bgp summary",
    "show bgp sum": "show bgp summary",
    "sh bgp ipv6 uni": "show bgp ipv6 unicast",
    "show ipv6 bgp": "show bgp ipv6 unicast",
    "sh bgp neigh": "show bgp neighbors",
    "show bgp neighbor": "show bgp neighbors",
    "sh ipv6 route": "show ipv6 route",
    "show route": "show ipv6 route",
    "ver": "show version",
    "exit": "whoami",
    "quit": "whoami"
};

let commandHistory = [];
let historyIndex = -1;

if (terminal && cliInput) {
    terminal.addEventListener("click", () => {
        cliInput.focus();
    });

    cliInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            const rawCommand = cliInput.value.trim();
            const command = rawCommand.toLowerCase();

            if (rawCommand.length > 0) {
                commandHistory.push(rawCommand);
                historyIndex = commandHistory.length;
            }

            printCommand(rawCommand);
            cliInput.value = "";

            runCommand(command);
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (commandHistory.length > 0 && historyIndex > 0) {
                historyIndex--;
                cliInput.value = commandHistory[historyIndex];
            }
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                cliInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                cliInput.value = "";
            }
        }

        if (event.key === "Tab") {
            event.preventDefault();
            autocompleteCommand();
        }
    });
}

function printCommand(command) {
    const line = document.createElement("div");
    line.className = "terminal-output";
    line.textContent = `${promptText} ${command}`;
    terminal.insertBefore(line, terminal.lastElementChild);
}

function printOutput(output) {
    const outputBlock = document.createElement("div");
    outputBlock.className = "terminal-output";
    outputBlock.textContent = output;
    terminal.insertBefore(outputBlock, terminal.lastElementChild);
    terminal.scrollTop = terminal.scrollHeight;
}

function runCommand(command) {
    if (command === "") {
        return;
    }

    if (command === "clear") {
        const inputLine = terminal.lastElementChild;
        terminal.innerHTML = "";
        terminal.appendChild(inputLine);
        cliInput.focus();
        return;
    }

    const resolvedCommand = aliases[command] || command;

    if (commands[resolvedCommand]) {
        printOutput(commands[resolvedCommand]);
    } else {
        printOutput(`% Unknown command: ${command}

Type "help" to view available commands.`);
    }
}

function autocompleteCommand() {
    const current = cliInput.value.toLowerCase();
    const allCommands = Object.keys(commands).concat(Object.keys(aliases));
    const match = allCommands.find(cmd => cmd.startsWith(current));

    if (match) {
        cliInput.value = match;
    }
}