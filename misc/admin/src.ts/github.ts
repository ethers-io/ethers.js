import { getUrl } from "./geturl";

export async function createRelease(user: string, password: string, tagName: string, title: string, body: string, prerelease?: boolean, commit?: string): Promise<string> {
    const result = await getUrl("https:/\/api.github.com/repos/ethers-io/ethers.js/releases", {
        body: Buffer.from(JSON.stringify({
            tag_name: tagName,
            target_commitish: (commit || "master"),
            name: title,
            body: body,
            //draft: true,
            draft: false,
            prerelease: !!prerelease
        })),
        method: "POST",

        headers: {
            "User-Agent": "ethers-io"
        },

        user: user,
        password: password
    });


    return JSON.parse(Buffer.from(result.body).toString("utf8")).html_url;
}

