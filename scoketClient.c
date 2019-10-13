#include <stdio.h>
#include <string.h>
#include <iconv.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include<stdlib.h>
#include<string.h>

#define ICONV_BUFFER_SIZE 1024
char    IconvOutputBuffer[ICONV_BUFFER_SIZE+1];

char* utf8tosjis (char *input) {
        iconv_t ic;
        char    str_in[ICONV_BUFFER_SIZE+1];
        char    *ptr_in  = str_in;
        char    *ptr_out = IconvOutputBuffer;
        size_t  sz = (size_t) ICONV_BUFFER_SIZE;
        strncpy(str_in, input,ICONV_BUFFER_SIZE-1);
        ic = iconv_open("SJIS","UTF-8");
        iconv(ic, &ptr_in, &sz, &ptr_out, &sz);
        iconv_close(ic);
        // printf("%s\n", IconvOutputBuffer);
        return IconvOutputBuffer;
}

int main() {

    int sockfd;
    struct sockaddr_in addr;
 
    // ソケット生成
    if( (sockfd = socket( AF_INET, SOCK_STREAM, 0) ) < 0 ) {
        perror( "socket" );
    }
 
    // 送信先アドレス・ポート番号設定
    addr.sin_family = AF_INET;
    addr.sin_port = htons( 12345 );
    addr.sin_addr.s_addr = inet_addr( "192.168.0.10" );
 
    // サーバ接続
    connect( sockfd, (struct sockaddr *)&addr, sizeof( struct sockaddr_in ) );
 
    // データ送信
    // char send_str[10];
    char receive_str[1000];

     typedef struct  {
     unsigned short id;
     unsigned char name[10];
    } __attribute__((__packed__)) innerData;

 typedef struct  {
     innerData inner;
     unsigned short id;
     innerData group[5];
     unsigned char name[10];
    } __attribute__((__packed__)) senddata;

senddata  data;
innerData recvData;
memset( &data, 0, sizeof(data) );

data.inner.id=htons(1);
strncpy(data.inner.name,utf8tosjis("thisisinner"),10);

data.id=htons(5);
strncpy(data.name,utf8tosjis("アウターテスト"),10);

data.group[3].id=htons(3);
strncpy(data.group[3].name,utf8tosjis("グループ3"),10);


printf("%ld %ld %ld\n",sizeof(data),sizeof(int),sizeof(char));


    for ( int i = 0; i < 10; i++ ){
        // sprintf( send_str, "%d", i );
        // printf( "send:%d\n", i );
        if( send( sockfd, &data, sizeof(data), 0 ) < 0 ) {
            perror( "send" );
        } 
        else {
memset( &recvData, 0, sizeof(recvData) );
            recv( sockfd, receive_str, sizeof(receive_str), 0 );
            int a=0;
memcpy( &recvData, receive_str, sizeof(recvData) );

printf("recv id :%d\n",ntohs( recvData.id));
printf("recv name :%s\n",( recvData.name));
                // printf( "receive:%s\n", receive_str );
            // for( a=0;a<20;a++){
                // printf( "%c\n", receive_str[a] );
            // }
        }
        sleep( 1 );
    }
 
    // ソケットクローズ
    close( sockfd );
 
    return 0;
}
