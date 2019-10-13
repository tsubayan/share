int main (int argc, char **argv) {

        /* 変数定義
         */
        iconv_t ic;
        char    str_in[MYBUFSZ+1];
        char    str_out[MYBUFSZ+1];
        char    *ptr_in  = str_in;
        char    *ptr_out = str_out;
        size_t  mybufsz = (size_t) MYBUFSZ;

        /* 変換元文字列を作成（このソースはEUCで書かれていて、変換元文字列もEUCで作成される）
         */
        strcpy(str_in, "テストの文字列。あいうえお。アカサタナ。");

        /* 文字コード変換処理
         */
        ic = iconv_open("SJIS","UTF-8");
        // ic = iconv_open("SJIS", "EUC-JP");
        iconv(ic, &ptr_in, &mybufsz, &ptr_out, &mybufsz);
        iconv_close(ic);

        /* 文字コード変換された文字列を出力
         */
        printf("%s\n", str_out);

        return 0;
}
