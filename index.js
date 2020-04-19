const core = require("@actions/core")
const exec = require("@actions/exec")
const github = require("@actions/github")
const io = require("@actions/io")
const ioUtil = require("@actions/io/lib/io-util")

async function run() {
  try {
    const accessToken = core.getInput("access-token", { required: true })

    let deployBranch = "master"

    await exec.exec(`yarn run build`, [])

    await io.cp("./CNAME", "./public/CNAME", { force: true })

    const repo = `${github.context.repo.owner}/${github.context.repo.repo}`
    const repoURL = `https://${accessToken}@github.com/${repo}.git`

    await exec.exec(`git init`, [], { cwd: "./public" })
    await exec.exec(`git config user.name`, [github.context.actor], {
      cwd: "./public",
    })
    await exec.exec(
      `git config user.email`,
      [`${github.context.actor}@users.noreply.github.com`],
      { cwd: "./public" }
    )
    await exec.exec(`git add`, ["."], { cwd: "./public" })
    await exec.exec(
      `git commit`,
      ["-m", `deployed via Gatsby Publish Action 🎩 for ${github.context.sha}`],
      { cwd: "./public" }
    )
    await exec.exec(`git push`, ["-f", repoURL, `master:${deployBranch}`], {
      cwd: "./public",
    })

    console.log("Finished deploying my blog.")
    console.log("Enjoy! ✨")
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
