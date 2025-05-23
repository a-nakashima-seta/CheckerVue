<script setup lang="ts">
import { ref, computed, ComputedRef, watch } from "vue";
import { CheckItem } from "../types/types";
import MailModeToggle from "./MailModeToggle.vue";

import {
  checkPageTitle,
  checkMailPreheader,
  checkMailApplicationNo,
  checkImageLinks,
  checkUTMCampaign,
  checkMailCPNLinkText,
  checkMailOpenTag,
  checkMailFooter,
  checkDependentText,
  checkAmpText,
  checkButtonTextBiyori,
  checkButtonHrefBiyori,
  checkURLZenkaku
} from "../utils/CheckFunc";

const MailCheckList = ref<CheckItem[]>([
  { id: "mail1", label: "タイトルは正しいか", checkFn: checkPageTitle },
  { id: "mail2", label: "プリヘッダーは正しいか", checkFn: checkMailPreheader },
  {
    id: "mail3",
    label: "冒頭変数の記述に誤りはないか",
    checkFn: checkMailApplicationNo,
  },
  { id: "mail4", label: "画像のリンク切れはないか", checkFn: checkImageLinks },
  {
    id: "mail5",
    label: "$$$utm_campaign$$$がないか",
    checkFn: checkUTMCampaign,
  },
  {
    id: "mail6",
    label: "※画像がうまく表示されない方はこちらがあるか",
    checkFn: checkMailCPNLinkText,
  },
  { id: "mail7", label: "開封タグはあるか", checkFn: checkMailOpenTag },
  {
    id: "mail8",
    label: "フッターが変数化されているか",
    checkFn: checkMailFooter,
  },
  { id: "mail9", label: "機種依存文字はないか", checkFn: checkDependentText },
  { id: "mail10", label: "URLに全角が含まれていないか", checkFn: checkURLZenkaku },
]);

let MailSource: string = "";
const selectedChecksMail = ref(
  new Array(MailCheckList.value.length).fill(true)
);
const errorMessages = ref<string[]>([]);
const statusResults = ref<string[]>(
  new Array(MailCheckList.value.length).fill("")
);
const checklistRef = ref<HTMLElement>(null!);
const checkTypeMail = ref<string>("通常");

// 日和とイチオシのオプションを監視
const checkFlg: ComputedRef<string | undefined> = computed(
  (): string | undefined => {
    if (checkTypeMail.value.includes("日和")) {
      return "日和";
    } else if (checkTypeMail.value.includes("通常")) {
      return "通常";
    } else if (checkTypeMail.value.includes("イチオシ")) {
      return "イチオシ";
    }
  }
);

// 日和とイチオシのオプションを監視し分岐に応じてリストの表示を変更
watch(checkFlg, (newFlg) => {
  if (newFlg === "イチオシ") {
    const mail6Index = MailCheckList.value.findIndex(
      (item) => item.id === "mail6"
    );
    if (mail6Index !== -1) {
      MailCheckList.value.splice(mail6Index, 1);
    }
  } else {
    const mail6Index = MailCheckList.value.findIndex(
      (item) => item.id === "mail6"
    );
    if (mail6Index === -1) {
      MailCheckList.value.splice(5, 0, {
        id: "mail6",
        label: "※画像がうまく表示されない方はこちらがあるか",
        checkFn: checkMailCPNLinkText,
      });
    }
  }

  // "日和"のときはmail10,mail11,mail12を追加
  if (newFlg === "日和") {
    MailCheckList.value.push(
      {
        id: "mail10",
        label: "新着コンテンツエリア内のボタンテキストは適切か",
        checkFn: checkButtonTextBiyori,
      },
      {
        id: "mail11",
        label:
          "新着コンテンツエリア内のボタン遷移先URLの末尾パラメータは適切か",
        checkFn: checkButtonHrefBiyori,
      },
      {
        id: "mail12",
        label: '"&amp;"を"&"に置換できているか',
        checkFn: checkAmpText,
      }
    );
  } else {
    // "biyori" 以外のときは mail10, mail11, mail12 を削除
    const idsToRemove = ["mail10", "mail11", "mail12"];
    idsToRemove.forEach((id) => {
      const index = MailCheckList.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        MailCheckList.value.splice(index, 1);
      }
    });
  }
  // 選択状態を更新
  selectedChecksMail.value = new Array(MailCheckList.value.length).fill(true);
});

const selectAll = () => {
  selectedChecksMail.value.fill(true);
};

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

const checkMailSource = async () => {
  if (selectedChecksMail.value.every((checked) => !checked)) {
    alert("チェック項目を選択してください");
    return;
  }

  if (MailSource !== "") {
    statusResults.value.fill("");
    errorMessages.value = [];

    const runAllChecks = async () => {
      for (let i = 0; i < MailCheckList.value.length; i++) {
        if (selectedChecksMail.value[i]) {
          const { checkFn } = MailCheckList.value[i];
          const result = await checkFn(MailSource);

          if (Array.isArray(result)) {
            result.forEach((message) => {
              if (message) {
                errorMessages.value.push(message);
              }
            });
          } else {
            if (result) {
              errorMessages.value.push(result);
            }
          }

          statusResults.value[i] = result && result.length > 0 ? "NG" : "OK";
        }
      }
    };

    await runAllChecks();

    const isSuccess: boolean = errorMessages.value.every(
      (value) => value == ""
    );

    if (isSuccess) {
      alert("チェックOKです！");
    } else {
      alert("エラー項目を確認して下さい。");
    }
  } else {
    alert("ファイルが選択されていません。");
  }
};
</script>

<template>
  <div style="width: 100%; max-width: 800px; margin: 0 auto">
    <h2 class="text-xl font-bold text-cyan-900">Mail用チェックリスト</h2>
    <div>
      <MailModeToggle v-model="checkTypeMail" />
    </div>

    <div class="fileUploader">
      <input class="border-2 border-emerald-500" id="uploader" type="file" @change="getMailSource" />
    </div>

    <div class="wrapper">
      <div class="selectButtonWrapper">
        <button class="selectButton" @click="selectAll">
          全選択
        </button>
        <button class="selectButton" @click="clearSelections">
          選択解除
        </button>
      </div>

      <ul class="checkList" ref="checklistRef">
        <h3 class="checkTypeName text-xl font-bold text-cyan-900">Mail</h3>
        <li v-for="(item, index) in MailCheckList" :key="item.id">
          <input type="checkbox" :id="item.id" v-model="selectedChecksMail[index]" />
          <label :for="item.id">{{ item.label }}</label>
          <span :style="{
            color: statusResults[index] === 'NG' ? '#f15f5f' : '#3FB27F',
          }">{{ statusResults[index] }}</span>
        </li>
      </ul>
      <button class="checkButton" @click="checkMailSource">
        チェック実行
      </button>

      <div class="errListWrapper" v-if="
        errorMessages.length && errorMessages.some((msg) => msg.trim() !== '')
      ">
        <h2>エラーリスト</h2>
        <ul class="errList">
          <li class="errListItem" v-for="(message, index) in errorMessages" :key="index">
            <p v-html="message"></p>
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
  background-color: #ffffff;
  padding: 5em 8em 3em;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}

.fileUploader input::file-selector-button {
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  border: none;
  background-color: #00dc82;
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

.MailCheckType {
  display: flex;
  justify-content: flex-end;
  max-width: 460px;
  margin: 0 auto;
  margin-bottom: 0.5em;
}

.MailCheckType label {
  user-select: none;
}
</style>
