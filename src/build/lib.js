const {
    spawn
} = require('child_process')

const exec = async function exec(cmd, args = []) {
    const child = spawn(cmd, args, {
        shell: true
    })
    redirectOutputFor(child)
    await waitFor(child)
}

const redirectOutputFor = (child) => {
    const printStdout = (data) => {
        process.stdout.write(data.toString())
    }
    const printStderr = (data) => {
        process.stderr.write(data.toString())
    }
    child.stdout.on('data', printStdout)
    child.stderr.on('data', printStderr)

    child.once('close', () => {
        child.stdout.off('data', printStdout)
        child.stderr.off('data', printStderr)
    })
}

const waitFor = async function(child) {
    return new Promise((resolve) => {
        child.once('close', () => resolve())
    })
}

module.exports.exec = exec