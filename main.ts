import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";
import { strEnc } from "./des.ts";

const parser = new DOMParser();

const cas = await fetch("https://vpn.jlu.edu.cn/login?cas_login=true");
const ticket_vpn =
    cas.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).filter(
        (cookie) => cookie.includes("wengine_vpn_ticketvpn_jlu_edu_cn"),
    )[0].split("=")[1];
const lt =
    ((parser.parseFromString(await cas.text(), "text/html")).querySelector(
        "#lt",
    )! as Element).getAttribute("value")!;

const username = Deno.env.get("JLU_USERNAME")!;
const password = Deno.env.get("JLU_PASSWORD")!;

const rsa = strEnc(username + password + lt);
await fetch(
    "https://vpn.jlu.edu.cn/https/44696469646131313237446964696461a979ef2609c4be59c95ff222d46b/tpass/login?service=https://vpn.jlu.edu.cn/login?cas_login=true",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": `wengine_vpn_ticketvpn_jlu_edu_cn=${ticket_vpn}`,
        },
        body:
            `rsa=${rsa}&ul=${username.length}&pl=${password.length}&sl=0&lt=${lt}&execution=e1s1&_eventId=submit`,
    },
);

const oa = await fetch(
    "https://vpn.jlu.edu.cn/https/44696469646131313237446964696461a579b2620fdde512c84ea96fd9/defaultroot/PortalInformation!jldxList.action",
    {
        headers: { "Cookie": `wengine_vpn_ticketvpn_jlu_edu_cn=${ticket_vpn}` },
    },
);

(parser.parseFromString(await oa.text(), "text/html")).querySelectorAll(
    "#itemContainer > div > a.font14",
).forEach((item) => {
    console.log(item.innerText);
});
