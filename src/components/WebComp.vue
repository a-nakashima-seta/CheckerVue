<script setup lang="ts">
import { ref, computed, ComputedRef, watch } from "vue";
import { CheckItem } from "../types/types";
import { Input } from "../components/ui/input";

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
  checkFavicon,
  checkButtonTextBiyori,
  checkButtonHrefBiyori,
  checkAmpText,
} from "../utils/CheckFunc";
import WebModeToggle from "./WebModeToggle.vue";

const WebCheckList = ref<CheckItem[]>([
  { id: "mail1", label: "タイトルは正しいか", checkFn: checkPageTitle },
  { id: "web2", label: "プリヘッダーはないか", checkFn: checkWebPreheader },
  { id: "web3", label: "冒頭に変数はないか", checkFn: checkWebApplicationNo },
  { id: "web4", label: "画像のリンク切れはないか", checkFn: checkImageLinks },
  {
    id: "web5",
    label: "$$$utm_campaign$$$がないか",
    checkFn: checkUTMCampaign,
  },
  {
    id: "web6",
    label: "※画像がうまく表示されない方はこちらがないか",
    checkFn: checkWebCPNLinkText,
  },
  { id: "web7", label: "開封タグはないか", checkFn: checkWebOpenTag },
  { id: "web8", label: "noindexの記述はあるか", checkFn: checkNoIndexMetaTag },
  {
    id: "web9",
    label: "フッターが変数化されていないか",
    checkFn: checkWebFooter,
  },
  { id: "web10", label: "GTM用の記述があるか", checkFn: checkGTM },
  { 
    id: "web11", 
    label: "faviconは設定されているか", 
    checkFn: (source: string) => checkFavicon(source, checkTypeWeb.value === 'SEAC')
  },
]);

let WebSource: string = "";
const selectedChecksWeb = ref(new Array(WebCheckList.value.length).fill(true));
const errorMessages = ref<string[]>([]);
const statusResults = ref<string[]>(
  new Array(WebCheckList.value.length).fill("")
);
const checklistRef = ref<HTMLElement | null>(null);
const url = ref<string>("");
const checkTypeWeb = ref<string>("通常");

// トグルオプションを監視
const checkFlg: ComputedRef<string | undefined> = computed(
  (): string | undefined => {
    if (checkTypeWeb.value.includes("日和")) {
      return "日和";
    } else if (checkTypeWeb.value.includes("通常")) {
      return "通常";
    } else if (checkTypeWeb.value.includes("SEAC")) {
      return "SEAC";
    }
  }
);

watch(checkFlg, (newFlg) => {
  if (newFlg === "日和") {
    WebCheckList.value.push(
      {
        id: "web12",
        label: "新着コンテンツエリア内のボタンテキストは適切か",
        checkFn: checkButtonTextBiyori,
      },
      {
        id: "web13",
        label:
          "新着コンテンツエリア内のボタン遷移先URLの末尾パラメータは適切か",
        checkFn: checkButtonHrefBiyori,
      },
      {
        id: "web14",
        label: '"&amp;"を"&"に置換できているか',
        checkFn: checkAmpText,
      }
    );
  } else {
    // "biyori" 以外のときは web12, web13, web14 を削除
    const idsToRemove = ["web12", "web13", "web14"];
    idsToRemove.forEach((id) => {
      const index = WebCheckList.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        WebCheckList.value.splice(index, 1);
      }
    });
  }
  selectedChecksWeb.value = new Array(WebCheckList.value.length).fill(true);
});

const selectAll = () => {
  selectedChecksWeb.value.fill(true);
};

const clearSelections = () => {
  selectedChecksWeb.value.fill(false);
};

const getWebSource = async () => {
  if (!url.value) {
    alert("URLが入力されていません。");
    return;
  }

  try {
    const username = "Setagaya";
    const password = "setagaya1234";
    const encodedString = btoa(`${username}:${password}`);
    const encodedAuth = `Basic ${encodedString}`;

    const response = await fetch(
      "http://www2.shizensyokuhin.jp/tool/html-checker/getSource.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: encodedAuth,
        },
        body: JSON.stringify({ url: url.value }),
      }
    );

    if (!response.ok) {
      throw new Error("ネットワークエラー: " + response.status);
    }

    const res = await response.json();

    if (res.html) {
      WebSource = res.html;
    }

    return true;
  } catch (error) {
    alert("ページソースの取得に失敗しました");
    console.error("ページソースの取得に失敗しました:", error);

    return false;
  }
};

const checkWebSource = async () => {
  if (selectedChecksWeb.value.every((checked) => !checked)) {
    alert("チェック項目を選択してください");
    return;
  }

  await getWebSource();

  if (WebSource !== "") {
    errorMessages.value = [];
    statusResults.value.fill("");

    const runAllChecks = async () => {
      for (let i = 0; i < WebCheckList.value.length; i++) {
        if (selectedChecksWeb.value[i]) {
          const { checkFn } = WebCheckList.value[i];
          const result = await checkFn(WebSource);

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

    const isSuccess = errorMessages.value.every((value) => value == "");
    if (isSuccess) {
      alert("チェックOKです！");
    } else {
      alert("エラー項目を確認して下さい。");
    }
  }
  
};
</script>

<template>
  <div style="width: 100%; max-width: 800px; margin: 0 auto">
    <h2 class="text-xl font-bold text-cyan-900">Web用チェックリスト</h2>
    <div class="webInputArea">
      <WebModeToggle v-model="checkTypeWeb" />

      <Input type="text" placeholder="チェック対象のurlを入力してください。" v-model="url" />
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
        <h3 class="checkTypeName text-xl font-bold text-cyan-900">Web</h3>
        <li v-for="(item, index) in WebCheckList" :key="item.id">
          <input type="checkbox" :id="item.id" v-model="selectedChecksWeb[index]" />
          <label :for="item.id">{{ item.label }}</label>
          <span :style="{
            color: statusResults[index] === 'NG' ? '#f15f5f' : '#3FB27F',
          }">{{ statusResults[index] }}</span>
        </li>
      </ul>
      <button class="checkButton" @click="checkWebSource">
        チェック実行
      </button>

      <div class="errListWrapper" v-if="
        errorMessages.length && errorMessages.some((msg) => msg.trim() !== '')
      ">
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
  border: solid 2px #00dc82;
  outline: none;
}

.webInputArea {
  margin-bottom: 25px;
}

.webCheckType {
  max-width: 420px;
  display: flex;
  justify-content: flex-end;
  margin: 0 auto;
  margin-bottom: 0.5em;
}
</style>
