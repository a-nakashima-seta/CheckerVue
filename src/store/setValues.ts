import { onMounted, ref } from 'vue';
import { defineStore } from 'pinia';

export const useSetValues = defineStore('setValues', () => {
    const title = ref<string>("");
    const preheader = ref<string>("");
    const prod_cd = ref<string>("");

    onMounted(() => {
        loadValues();
    });

    const loadValues = () => {
        const storedTitle = localStorage.getItem("title");
        const storedPreheader = localStorage.getItem("preheader");
        const storedProdCd = localStorage.getItem("prod_cd");

        if (storedTitle) title.value = storedTitle;
        if (storedPreheader) preheader.value = storedPreheader;
        if (storedProdCd) prod_cd.value = storedProdCd;
    };

    const saveValues = () => {
        localStorage.setItem("title", title.value);
        localStorage.setItem("preheader", preheader.value);
        localStorage.setItem("prod_cd", prod_cd.value);
    };

    return { prod_cd, title, preheader, loadValues, saveValues };
});
