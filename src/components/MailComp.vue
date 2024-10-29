<script setup lang="ts">
import { ref } from 'vue';
import { CheckItem } from "../types/types";

import {
    checkPageTitle,
    checkMailPreheader,
    checkMailApplicationNo,
    checkImageLinks,
    checkUTMCampaign,
    checkMailCPNLinkText,
    checkMailOpenTag,
    checkMailFooter,
    checkDependentText
} from "../utils/CheckFunc";

const MailCheckList: CheckItem[] = [
    { id: "mail1", label: "タイトルは正しいか" },
    { id: "mail2", label: "プリヘッダーは正しいか" },
    { id: "mail3", label: "冒頭に変数があり、正しい申込番号が入っているか" },
    { id: "mail4", label: "画像のリンク切れはないか" },
    { id: "mail5", label: "$$$utm_campaign$$$がないか" },
    { id: "mail6", label: "※画像がうまく表示されない方はこちらがあるか" },
    { id: "mail7", label: "開封タグはあるか" },
    { id: "mail8", label: "フッターが変数化されているか" },
    { id: "mail9", label: "機種依存文字はないか" }
];

let MailSource: string = "";
const selectedChecksMail = ref(new Array(MailCheckList.length).fill(true));
const errorMessages = ref<string[]>([]);
const statusResults = ref<string[]>(new Array(MailCheckList.length).fill(''));
const checklistRef = ref<HTMLElement>(null!);

const selectAll = () => {
    selectedChecksMail.value.fill(true);
}

const clearSelections = () => {
    selectedChecksMail.value.fill(false);
};

const getMailSource = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        const file = target.files[0];
        try {
            const text = await file.text();
            MailSource = text;
        } catch (error) {
            console.error("ファイルの読み込みエラー:", error);
        }
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


const checkMailSource = async () => {
    if (selectedChecksMail.value.every((checked) => !checked)) {
        alert("チェック項目を選択してください");
        return;
    }

    errorMessages.value = [];
    statusResults.value.fill('');



    if (MailSource !== "") {
        const runAllChecks = async () => {
            if (selectedChecksMail.value[0]) {
                const titleCheck = checkPageTitle(MailSource);
                errorMessages.value.push(titleCheck ? titleCheck : '');
                statusResults.value[0] = titleCheck ? 'NG' : 'OK';
            }
            if (selectedChecksMail.value[1]) {
                const preheaderCheck = checkMailPreheader(MailSource);
                errorMessages.value.push(preheaderCheck ? preheaderCheck : '');
                statusResults.value[1] = preheaderCheck ? 'NG' : 'OK';
            }
            if (selectedChecksMail.value[2]) {
                const applicationNoCheck = checkMailApplicationNo(MailSource);
                errorMessages.value.push(applicationNoCheck ? applicationNoCheck : '');
                statusResults.value[2] = applicationNoCheck ? 'NG' : 'OK';
            }
            if (selectedChecksMail.value[3]) {
                const imageCheck = await checkImageLinks(MailSource);
                errorMessages.value.push(...imageCheck);
                statusResults.value[3] = imageCheck.length ? 'NG' : 'OK';
            }
            if (selectedChecksMail.value[4]) {
                const utmCheck = checkUTMCampaign(MailSource);
                errorMessages.value.push(utmCheck ? utmCheck : '');
                statusResults.value[4] = utmCheck ? 'NG' : 'OK';
            }
            if (selectedChecksMail.value[5]) {
                const specialTextCheck = checkMailCPNLinkText(MailSource);
                errorMessages.value.push(specialTextCheck ? specialTextCheck : '');
                statusResults.value[5] = specialTextCheck ? 'NG' : 'OK';
            }
            if (selectedChecksMail.value[6]) {
                const openTagCheck = checkMailOpenTag(MailSource);
                errorMessages.value.push(openTagCheck ? openTagCheck : '');
                statusResults.value[6] = openTagCheck ? 'NG' : 'OK';
            }
            if (selectedChecksMail.value[7]) {
                const footerCheck = checkMailFooter(MailSource);
                errorMessages.value.push(footerCheck ? footerCheck : '');
                statusResults.value[7] = footerCheck ? 'NG' : 'OK';
            }
            if (selectedChecksMail.value[8]) {
                const dependentTextCheck = checkDependentText(MailSource);
                errorMessages.value.push(dependentTextCheck ? dependentTextCheck : '');
                statusResults.value[8] = dependentTextCheck ? 'NG' : 'OK';
            }

            console.log(MailSource);
            console.log("結果:", statusResults.value);
            console.log("エラーメッセージ:", errorMessages.value);
        }

        await runAllChecks()

        const isSuccess = statusResults.value.every(value => value == "OK")
        if (isSuccess) {

            alert("チェックOKです！")
            // キャプチャは手動で保存する運用のためいったんコメントアウト
            // await captureChecklist();
        } else {
            alert("エラー項目を確認して下さい。")
        }

    } else {
        alert("ファイルが選択されていません。");
    }

};
</script>

<template>
    <div style="width: 100%; max-width: 800px; margin: 0 auto;">
        <h2>Mail用チェックリスト</h2>

        <div class="fileUploader">
            <input id="uploader" type="file" @change="getMailSource">
        </div>

        <div class="wrapper">
            <div class="selectButtonWrapper">
                <button class="selectButton" @click="selectAll">全選択</button>
                <button class="selectButton" @click="clearSelections">選択解除</button>
            </div>

            <ul class="checkList" ref="checklistRef">
                <h3 class="checkTypeName">Mail</h3>
                <li v-for="(item, index) in MailCheckList" :key="item.id">
                    <input type="checkbox" :id="item.id" v-model="selectedChecksMail[index]">
                    <label :for="item.id">{{ item.label }}</label>
                    <span :style="{ color: statusResults[index] === 'NG' ? '#f15f5f' : '#3FB27F' }">{{ statusResults[index] }}</span>
                </li>
            </ul>
            <button class="checkButton" @click="checkMailSource">チェック実行</button>


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
.fileUploader {
    width: 100%;
}

.fileUploader input {
    background-color: #FFFFFF;
    padding: 5em 8em 3em;
    border: solid 2px #00DC82;
    border-radius: 5px;
    position: relative;
}

.fileUploader input::file-selector-button {
    color: #FFFFFF;
    font-size: 14px;
    font-weight: bold;
    border: none;
    background-color: #00DC82;
    margin: 0;
    margin-right: 5px;
    padding: 10px 15px;
    border-radius: 20px;
    cursor: pointer;
}

.fileUploader input::before {
    content: "ファイルを選択またはドラッグアンドドロップして下さい。";
    position: absolute;
    top: 2.5em;
    right: 3em;
}
</style>
