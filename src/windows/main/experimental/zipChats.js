function zipChats(elements, chats) {
    let e0 = elements[0];
    let e = Array.from(elements);
    e.shift();
    e.reverse();
    e.unshift(e0);
    let zipped = e.map((e, i) => [e, chats[i]]);
    return zipped;
}

module.exports = {
    zipChats
}