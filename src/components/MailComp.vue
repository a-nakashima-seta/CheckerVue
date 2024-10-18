<script setup lang="ts">
import { ref } from 'vue';
import html2canvas from 'html2canvas';
import {
    checkPageTitle,
    checkMailPreheader,
    checkMailApplicationNo,
    checkImageLinks,
    checkUTMCampaign,
    checkForSpecialText,
    checkNoIndexOpenTag,
    checkFooter,
} from "../utils/mailCheckFunc";

const MailCheckList = [
    "タイトルは正しいか",
    "プリヘッダーは正しいか",
    "冒頭に変数があり、正しい申込番号が入っているか",
    "画像のリンク切れはないか",
    "$$$utm_campaign$$$がないか",
    "※画像がうまく表示されない方はこちらがあるか",
    "開封タグはあるか",
    "フッターが変数化されているか"
];

let MailSource = "";
const selectedChecks = ref(new Array(MailCheckList.length).fill(true));
const errorMessages = ref<string[]>([]);
const statusResults = ref<string[]>(new Array(MailCheckList.length).fill(''));
const checklistRef = ref<HTMLElement | null>(null);

const selectAll = () => {
    selectedChecks.value.fill(true);
}

const clearSelections = () => {
    selectedChecks.value.fill(false);
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

const captureChecklist = async () => {
    if (checklistRef.value) {
        const canvas = await html2canvas(checklistRef.value);
        canvas.toBlob(async (blob) => {
            if (blob) {
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]).then(() => {
                    alert('チェックリストをクリップボードにコピーしました!');
                });
            }
        });
    }
};

const checkMailSource = async () => {
    if (selectedChecks.value.every((checked) => !checked)) {
        alert("チェック項目を選択してください");
        return;
    }

    errorMessages.value = [];
    statusResults.value.fill('');

    if (MailSource !== "") {
        if (selectedChecks.value[0]) {
            const titleCheck = checkPageTitle(MailSource);
            errorMessages.value.push(titleCheck ? titleCheck : '');
            statusResults.value[0] = titleCheck ? 'NG' : 'OK';
        }
        if (selectedChecks.value[1]) {
            const preheaderCheck = checkMailPreheader(MailSource);
            errorMessages.value.push(preheaderCheck ? preheaderCheck : '');
            statusResults.value[1] = preheaderCheck ? 'NG' : 'OK';
        }
        if (selectedChecks.value[2]) {
            const applicationNoCheck = checkMailApplicationNo(MailSource);
            errorMessages.value.push(applicationNoCheck ? applicationNoCheck : '');
            statusResults.value[2] = applicationNoCheck ? 'NG' : 'OK';
        }
        if (selectedChecks.value[3]) {
            const imageCheck = await checkImageLinks(MailSource);
            errorMessages.value.push(...imageCheck);
            statusResults.value[3] = imageCheck.length ? 'NG' : 'OK';
        }
        if (selectedChecks.value[4]) {
            const utmCheck = checkUTMCampaign(MailSource);
            errorMessages.value.push(utmCheck ? utmCheck : '');
            statusResults.value[4] = utmCheck ? 'NG' : 'OK';
        }
        if (selectedChecks.value[5]) {
            const specialTextCheck = checkForSpecialText(MailSource);
            errorMessages.value.push(specialTextCheck ? specialTextCheck : '');
            statusResults.value[5] = specialTextCheck ? 'NG' : 'OK';
        }
        if (selectedChecks.value[6]) {
            const openTagCheck = checkNoIndexOpenTag(MailSource);
            errorMessages.value.push(openTagCheck ? openTagCheck : '');
            statusResults.value[6] = openTagCheck ? 'NG' : 'OK';
        }
        if (selectedChecks.value[7]) {
            const footerCheck = checkFooter(MailSource);
            errorMessages.value.push(footerCheck ? footerCheck : '');
            statusResults.value[7] = footerCheck ? 'NG' : 'OK';
        }

        console.log(MailSource);
        console.log("結果:", statusResults.value);
        console.log("エラーメッセージ:", errorMessages.value);

        await captureChecklist();


    } else {
        alert("ファイルが選択されていません。");
    }

};
</script>

<template>
    <div style="width: 100%; max-width: 800px; margin: 0 auto;">
        <h2>Mail用チェックリスト</h2>

        <input type="file" @change="getMailSource">

        <div class="wrapper">
            <div class="selectButtonWrapper">
                <button class="selectButton" @click="selectAll">全選択</button>
                <button class="selectButton" @click="clearSelections">選択解除</button>
            </div>

            <ul class="checkList" ref="checklistRef">
                <li v-for="(item, index) in MailCheckList" :key="index">
                    <input type="checkbox" :id="item" v-model="selectedChecks[index]">
                    <label :for="item">{{ item }}</label>
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
.wrapper {
    margin: 1em 0;
}

.selectButtonWrapper {
    display: flex;
    justify-content: flex-end;
    gap: 2%;
}

.checkList {
    background-color: #FFFFFF;
    border-radius: .5em;
    padding: 1em;
    text-align: left;
    margin: 0.4em 0;
}

.checkList span {
    margin-left: 10px;
    font-weight: bold;
}

.selectButton,
.checkButton {
    background-color: #FFFBE6;
    transition: all .3s ease;
}

.selectButton:hover,
.checkButton:hover {
    background-color: #FCCD2A;
}

.selectButton {
    display: block;
    font-size: 14px;
}

.checkButton {
    margin: 1em auto 0;
    background-color: #C0EBA6;
}

.checkButton:hover {
    background-color: #347928;
    color: #FFFFFF;
}

.errListWrapper {
    background-color: #FFFFFF;
    width: 100%;
    margin-top: 3em;
    padding-bottom: .5em;
    border-radius: .5em;
}

.errListWrapper h2 {
    margin: 0;
    padding: 1em 0 0;
    color: #f15f5f;
}

.errList {
    list-style: none;
    width: 95%;
    padding: 0;
    margin: 0 auto;
}

.errListItem {
    width: 100%;
    list-style: none;
}

.errListItem p {
    width: 100%;
    display: block;
    list-style: none;
    text-align: left;
    word-break: break-all;
}
</style>
