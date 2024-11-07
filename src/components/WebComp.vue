<script setup lang="ts">
import { ref } from 'vue';
import { CheckItem } from "../types/types";

import {
    checkPageTitle,
    checkWebPreheader,
    checkWebApplicationNo,
    checkImageLinks,
    checkUTMCampaign,
    checkWebCPNLinkText,
    checkWebOpenTag,
    checkNoIndexMetaTag,
    checkWebFooter,
    checkGTM,
    checkFavicon
} from "../utils/CheckFunc";

const WebCheckList: CheckItem[] = [
    { id: "web1", label: "タイトルは正しいか" },
    { id: "web2", label: "プリヘッダーはないか" },
    { id: "web3", label: "冒頭に変数はないか" },
    { id: "web4", label: "画像のリンク切れはないか" },
    { id: "web5", label: "$$$utm_campaign$$$がないか" },
    { id: "web6", label: "※画像がうまく表示されない方はこちらがないか" },
    { id: "web7", label: "開封タグはないか" },
    { id: "web8", label: "noindexの記述はあるか" },
    { id: "web9", label: "フッターが変数化されていないか" },
    { id: "web10", label: "GTM用の記述があるか" },
    { id: "web11", label: "faviconは設定されているか" }
];

let WebSource: string = "";
const selectedChecksWeb = ref(new Array(WebCheckList.length).fill(true));
const errorMessages = ref<string[]>([]);
const statusResults = ref<string[]>(new Array(WebCheckList.length).fill(''));
const checklistRef = ref<HTMLElement | null>(null);
const url = ref<string>('');
const checkTypeWeb = ref<string>("normal")

const selectAll = () => {
    selectedChecksWeb.value.fill(true);
}

const clearSelections = () => {
    selectedChecksWeb.value.fill(false);
};

const getWebSource = async () => {
    if (!url.value) {
        alert('URLが入力されていません。');
        return;
    }

    try {
        const username = "Setagaya"
        const password = "setagaya1234"
        const encodedString = btoa(`${username}:${password}`);
        const encodedAuth = `Basic ${encodedString}`;

        const response = await fetch('http://www2.shizensyokuhin.jp/tool/html-checker/getSource.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": encodedAuth,
            },
            body: JSON.stringify({ url: url.value })
        });

        if (!response.ok) {
            throw new Error('ネットワークエラー: ' + response.status);
        }

        const res = await response.json();

        if (res.html) {
            WebSource = res.html
        }

        return true
    } catch (error) {
        alert('ページソースの取得に失敗しました');
        console.error('ページソースの取得に失敗しました:', error);

        return false
    }
};


// キャプチャは手動で保存する運用のためいったんコメントアウト
// const captureChecklist = async () => {
//     if (checklistRef.value) {
//         const canvas = await html2canvas(checklistRef.value);
//         canvas.toBlob(async (blob) => {
//             if (blob) {
//                 const item = new ClipboardItem({ 'image/png': blob });
//                 await navigator.clipboard.write([item]).then(() => {
//                     alert('チェックOKです!');
//                     alert('チェックリストをクリップボードにコピーしました!');
//                 });
//             }
//         });
//     }
// };

const checkWebSource = async () => {
    if (selectedChecksWeb.value.every((checked) => !checked)) {
        alert("チェック項目を選択してください");
        return;
    }

    errorMessages.value = [];
    statusResults.value.fill('');


    await getWebSource()

    if (WebSource !== "") {
        const runAllChecks = async () => {
            if (selectedChecksWeb.value[0]) {
                const titleCheck = checkPageTitle(WebSource);
                errorMessages.value.push(titleCheck ? titleCheck : '');
                statusResults.value[0] = titleCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[1]) {
                const preheaderCheck = checkWebPreheader(WebSource);
                errorMessages.value.push(preheaderCheck ? preheaderCheck : '');
                statusResults.value[1] = preheaderCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[2]) {
                const applicationNoCheck = checkWebApplicationNo(WebSource);
                errorMessages.value.push(applicationNoCheck ? applicationNoCheck : '');
                statusResults.value[2] = applicationNoCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[3]) {
                const imageCheck = await checkImageLinks(WebSource);
                errorMessages.value.push(...imageCheck);
                statusResults.value[3] = imageCheck.length ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[4]) {
                const utmCheck = checkUTMCampaign(WebSource);
                errorMessages.value.push(utmCheck ? utmCheck : '');
                statusResults.value[4] = utmCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[5]) {
                const specialTextCheck = checkWebCPNLinkText(WebSource);
                errorMessages.value.push(specialTextCheck ? specialTextCheck : '');
                statusResults.value[5] = specialTextCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[6]) {
                const openTagCheck = checkWebOpenTag(WebSource);
                errorMessages.value.push(openTagCheck ? openTagCheck : '');
                statusResults.value[6] = openTagCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[7]) {
                const noindexCheck = checkNoIndexMetaTag(WebSource);
                errorMessages.value.push(noindexCheck ? noindexCheck : '');
                statusResults.value[7] = noindexCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[8]) {
                const footerCheck = checkWebFooter(WebSource);
                errorMessages.value.push(footerCheck ? footerCheck : '');
                statusResults.value[8] = footerCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[9]) {
                const GTMCheck = checkGTM(WebSource);
                errorMessages.value.push(GTMCheck ? GTMCheck : '');
                statusResults.value[9] = GTMCheck ? 'NG' : 'OK';
            }
            if (selectedChecksWeb.value[10]) {
                const faviconCheck = checkFavicon(WebSource, checkTypeWeb.value === "seac");
                errorMessages.value.push(faviconCheck ? faviconCheck : '');
                statusResults.value[10] = faviconCheck ? 'NG' : 'OK';
            }

        }

        console.log(WebSource);
        console.log("結果:", statusResults.value);
        console.log("エラーメッセージ:", errorMessages.value);


        await runAllChecks()

        const isSuccess = errorMessages.value.every(value => value == "");
        if (isSuccess) {
            alert("チェックOKです！")
            // キャプチャは手動で保存する運用のためいったんコメントアウト
            // await captureChecklist();
        } else {
            alert("エラー項目を確認して下さい。")
        }

    }

};
</script>

<template>
    <div style="width: 100%; max-width: 800px; margin: 0 auto;">
        <h2>Web用チェックリスト</h2>
        <div class="webInputArea">
            <div class="webCheckType">
                <input type="radio" id="normal" name="checkType" value="normal" v-model="checkTypeWeb">
                <label for="normal">通常</label>
                <input type="radio" id="seac" name="checkType" value="seac" v-model="checkTypeWeb">
                <label for="seac">SEAC</label>
            </div>
            <input class="getWebSourceArea" type="text" placeholder="チェック対象のurlを入力してください。" v-model="url">
        </div>

        <div class="wrapper">
            <div class="selectButtonWrapper">
                <button class="selectButton" @click="selectAll">全選択</button>
                <button class="selectButton" @click="clearSelections">選択解除</button>
            </div>

            <ul class="checkList" ref="checklistRef">
                <h3 class="checkTypeName">Web</h3>
                <li v-for="(item, index) in WebCheckList" :key="item.id">
                    <input type="checkbox" :id="item.id" v-model="selectedChecksWeb[index]">
                    <label :for="item.id">{{ item.label }}</label>
                    <span :style="{ color: statusResults[index] === 'NG' ? '#f15f5f' : '#3FB27F' }">{{ statusResults[index] }}</span>
                </li>
            </ul>
            <button class="checkButton" @click="checkWebSource">チェック実行</button>


            <div class="errListWrapper" v-if="errorMessages.length && errorMessages.some(msg => msg.trim() !== '')">
                <h2>エラーリスト</h2>
                <ul class="errList">
                    <li class="errListItem" v-for="(message, index) in errorMessages" :key="index">
                        <p>
                            {{ message }}
                        </p>
                    </li>
                </ul>
            </div>
        </div>

    </div>
</template>

<style scoped>
.getWebSourceArea {
    display: block;
    box-sizing: border-box;
    margin: 0 auto;
    font-size: 16px;
    height: 20px;
    max-width: 420px;
    width: 100%;
    margin-bottom: 1em;
    border: none;
    height: 30px;
    border: solid 1px #213547;
    border-radius: 5px;
}

.getWebSourceArea:focus-visible {
    box-sizing: border-box;
    border: solid 2px #00DC82;
    outline: none;
}

.webInputArea {
    margin-top: 55px;
    margin-bottom: 67px;
}

.webCheckType {
    max-width: 420px;
    display: flex;
    justify-content: flex-end;
    margin: 0 auto;
    margin-bottom: .5em;
}
</style>
