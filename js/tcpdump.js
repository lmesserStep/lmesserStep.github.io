const output = document.getElementById("tcpdump-output");

const protocols = ["TCP", "UDP", "ICMP", "ARP"];
const flags = ["S", "S.", "P.", "F.", "."];
const ports = [22, 53, 80, 443, 3389, 51820, 8080, 5060];

function randomIP() {
    return `${Math.floor(Math.random()*223)+1}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
}

function randomPort() {
    return ports[Math.floor(Math.random() * ports.length)];
}

function randomProtocol() {
    return protocols[Math.floor(Math.random() * protocols.length)];
}

function randomFlag() {
    return flags[Math.floor(Math.random() * flags.length)];
}

function generateLine() {
    const now = new Date();
    const time = now.toTimeString().split(" ")[0];

    const src = `${randomIP()}.${randomPort()}`;
    const dst = `${randomIP()}.${randomPort()}`;
    const proto = randomProtocol();

    if (proto === "TCP") {
        return `${time} IP ${src} > ${dst}: Flags [${randomFlag()}], seq ${Math.floor(Math.random()*100000)}, win 64240, length ${Math.floor(Math.random()*1500)}`;
    }

    if (proto === "UDP") {
        return `${time} IP ${src} > ${dst}: UDP, length ${Math.floor(Math.random()*512)}`;
    }

    if (proto === "ICMP") {
        return `${time} IP ${src} > ${dst}: ICMP echo request, id ${Math.floor(Math.random()*65535)}, seq ${Math.floor(Math.random()*1000)}, length 64`;
    }

    return `${time} ARP, Request who-has ${randomIP()} tell LANRanger length 46`;
}

function appendLine() {
    output.textContent += generateLine() + "\n";

    if (output.textContent.split("\n").length > 20) {
        const lines = output.textContent.split("\n");
        lines.shift();
        output.textContent = lines.join("\n");
    }

    output.scrollTop = output.scrollHeight;
}

setInterval(appendLine, 250);