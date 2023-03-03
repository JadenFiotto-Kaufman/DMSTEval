<template>
    <div>
        <b-container v-if="!done" fluid style="margin-top:20px">
            <b-row class="text-center"><b-col>
                    <h5>Please review these works of art from {{ current_artist }}</h5>
                </b-col></b-row>
            <b-row align-h="center">
                <b-col style="margin-top:20px" cols="auto" v-for="image in example_images">
                    <b-img
                        v-b-popover.hover="{ html: true, content: '<img style=\'height:512px;width:512px\' src=\'' + image + '\'></img>' }"
                        :src="image" :height="256" :width="256"></b-img>
                </b-col>
            </b-row>
            <hr style=" border-top: 10px solid rgba(0, 0, 0, 1.0);">
            <b-row style="margin-top:20px">
                <b-col>
                    <b-row style="justify-content: center;">
                        <h6>{{ study_images.length }} cases left. {{ Object.keys(this.images).length }} artists to go</h6>
                    </b-row>
                    <b-row style="justify-content: center;">
                        <b-img :src="study_image" :height="512" :width="512">
                        </b-img>
                    </b-row>
                    <b-row style="justify-content: center;">
                        <p style="font-size:120%;">How confident are you that this image is from {{ current_artist }}? <br>
                            (1 being least
                            confident and 5 being most confident)</p>
                    </b-row>
                    <b-row style="justify-content: center;">
                        <b-button-group size="sm">
                            <b-button style="width:80px; height:50px" @click="rating = 1" :disabled="rating == 1"
                                variant="danger">
                                1
                            </b-button>
                            <b-button style="width:80px; height:50px" @click="rating = 2" :disabled="rating == 2"
                                variant="warning">
                                2
                            </b-button>
                            <b-button style="width:80px; height:50px" @click="rating = 3" :disabled="rating == 3"
                                variant="secondary">
                                3
                            </b-button>
                            <b-button style="width:80px; height:50px" @click="rating = 4" :disabled="rating == 4"
                                variant="primary">
                                4
                            </b-button>
                            <b-button style="width:80px; height:50px" @click="rating = 5" :disabled="rating == 5"
                                variant="success">
                                5
                            </b-button>
                        </b-button-group></b-row>
                </b-col>
            </b-row>
            <b-row style="justify-content: center;"><b-button
                    style="width:90px; height:60px; margin-top: 30px; margin-bottom: 50px;" @click="submit_rating"
                    variant="primary">Next</b-button></b-row>

        </b-container>
        <div v-if="done" style="width:100vw; height:100vh; background-image: url('gj.jpg')"></div>
    </div>
</template>

<script>

import axios from 'axios'
import fs from '../assets/fs.json'
import Vue from 'vue'

const SHEET_ID = "1xD3BjxdUqxo9PJKh1zfWcHnsE9HugH8Sb1dpBIhPDkA";
const API_KEY =
    "AIzaSyCJRbZ98MM1rYZH-GQ_1USj5OmEeZ6STiQ";

export default {
    name: 'Form',
    data() {
        return {
            current_artist: null,
            example_images: [],
            study_images: [],
            study_image: null,
            rating: null,
            done: false,
            images: fs,
            case_numer: 1,
            id: this.CreateUUID()
        }
    },
    methods: {

        submit_rating() {

            if (this.rating != null) {
                let value_body = { "uuid": this.id, "artist": this.current_artist, "image": this.study_image, "rating": this.rating }

                var body = JSON.stringify({
                    requests: [
                        {
                            appendCells: {
                                rows: [
                                    {
                                        values: [
                                            {
                                                userEnteredValue: {
                                                    stringValue: this.id,
                                                },
                                            },
                                            {
                                                userEnteredValue: {
                                                    stringValue: this.current_artist,
                                                },
                                            },
                                            {
                                                userEnteredValue: {
                                                    stringValue: this.study_image,
                                                },
                                            },
                                            {
                                                userEnteredValue: {
                                                    numberValue: this.rating,
                                                },
                                            }
                                        ],
                                    },
                                ],
                                fields: "*",
                            },
                        },
                    ],
                })

                gapi.client.sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID }, body).then(function (response) {
                    // TODO: Change code below to process the `response` object:
                    console.log(response.result);
                }, function (reason) {
                    console.error('error: ' + reason.result.error.message);
                });

                this.rating = null

                this.next_image()

            }
        },
        next_image() {
            if (this.study_images.length == 0) {
                this.init_new_artist()
            }
            else {
                this.study_image = this.study_images[0]
                this.study_images.splice(0, 1)
            }
        },
        init_new_artist() {

            let artist_names = Object.keys(this.images)

            if (artist_names.length > 0) {

                this.current_artist = artist_names[this.getRandomInt(artist_names.length)]

                this.images[this.current_artist]['real_artist'] = this.shuffle(this.images[this.current_artist]['real_artist'])
                this.example_images = this.images[this.current_artist]['real_artist'].slice(0, 5)

                this.images[this.current_artist]['real_artist'].splice(0, 5)

                console.log(Object.keys(this.images[this.current_artist]))

                this.study_images = []

                let SLD_from = []
                let SDNG_from = []

                for (const type_key in this.images[this.current_artist]) {
                    if (type_key.startsWith('SLD_from')) {
                        SLD_from.push(...this.images[this.current_artist][type_key])
                    }
                    else if (type_key.startsWith('SDNG_from')) {
                        SDNG_from.push(...this.images[this.current_artist][type_key])
                    }
                    else if (type_key.startsWith('from')) {

                        continue
                    }
                    else {
                        this.study_images.push(...this.shuffle(this.images[this.current_artist][type_key]).slice(0, 5))
                    }
                }

                this.study_images.push(...this.shuffle(SLD_from).slice(0, 20))
                this.study_images.push(...this.shuffle(SDNG_from).slice(0, 20))

                this.study_images = this.shuffle(this.study_images)

                delete this.images[this.current_artist]

                this.next_image()

            }

            else {
                this.done = true
            }

        },
        getRandomInt(max) {
            return Math.floor(Math.random() * max);
        },
        shuffle(array) {
            let currentIndex = array.length, randomIndex;

            // While there remain elements to shuffle.
            while (currentIndex != 0) {

                // Pick a remaining element.
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }

            return array;
        },
        CreateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    },

    mounted() {

        Vue.loadScript('https://apis.google.com/js/api.js').then(() => {
            Vue.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.0.0-rc.1/jsencrypt.min.js').then(() => {
                Vue.loadScript('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js').then(() => {
                    Vue.loadScript('https://cdn.jsdelivr.net/gh/tanaikech/GetAccessTokenFromServiceAccount_js@master/getaccesstokengromserviceaccount_js.min.js').then(() => {
                        gapi.load('client', () => init(this));

                        
                        async function init(ths) {
                            const object = {
                                private_key: "-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQCg+cafX2D1o1zc\n49kW3Mxpx/1dOk4T0UB76M0pQPVdksJkYMFemPTKLPJcMb7U3lNEXJ5aowRlbAsN\ng+9J+QQ3A/EO1qirEjAO4f7VV7EqagUdY442ybNnBq2iqGZbAOsTQRWqvkqMdVEQ\nC8UPPZXN/0HrXEq7xFDnSudjhi0/xNMvIaFfWR2YOOoM/zB47+Zqmcf+9zlsXMWz\nFAHJ4OiKH/t1tXm1FShSquo/XfxC5grO6Vr5ADZhgCxEpD5LT+f8ry9G726PUyFx\nJiMUX6KM5px6IRU/wIPQy4z/p7Rso5zeeCbeU8FUYjkDJ0Ef5jDDwbOK/aCJBKQn\n27Ibht65AgMBAAECgf9q1z7meVDoxvVql1b+r/b8PnyYPkAbjL9HYEPaFh15FFDx\nMFW+AorQeASB8CgLL97X8ZH7eCgB3X88RHqkHjHEjjsOeIi2a662MgzajI4RggE9\nabCYQxnmEr1ZIYoZJ8aiCGr3LBlOmK0AHwvvc3+nQTTwNkm+KOERGryH/vcngIOT\nJJRBSrWRAXYZUqZhQBNi57TEhdS4pbkH946A1WdK+Ex7SXEJDH8cYuaFyPbtXATm\nxf+UcdMw+ftBrQ588Y8W7RSmiqxzMXMfCayuU1ELGl3dZMFbAYckikdVHNUBZcXt\nAqJPVSiPEOkHtsuX/QKXArgYXqPRiLioL3AH8UECgYEA3GecPeREgOKr3v2vMZsd\nbj3Vsp/CXcX9DiObjO9f83i9J2iwGGGAndb7FP1sFUX2eyW4decQixaIKyaS5D6q\nHydTwgdlaF9cpduGvkgaHO9fdiWGPCCLZVQNhaXLrGuU2AIcUwgYvPZ7RHO56uzg\nuZAiczSPjFghf6zy+xY5FBECgYEAuvkjOTn05J9KtUnG9RPyTyf28v11zmMMwe1D\nMS/iXcSPRRRWMPAcUHUgrswwoB73y7YtXiJrDH1MS2P6om6rTBW5HYBGOSkeHg1V\nKnY25vLR6NPKtAK4EHtPc5+6jFL1OS8yb97J+fB2tgWOqGFu/03TE2vgfzww5bXD\n7M1AKCkCgYBx0b/J5nvJ40TGn1M91tDYAW6+E+qX6orIJnNJ0MRIQ23LUDDAJnn5\nCPAY4tZSFhM3fT9JA85zRWuEfSMWY5YPCIwkgxVHVRfPPxLSaQGzN5qgtLghjNzv\nsvxYrEoF/HidJFnkNyYvT0pRC0JTo4hZy6k+vUH0Q/7opDPGnq9TQQKBgC9+6ju3\nRUZuUIQM4cWP85W4CTtgt3ReJPd+VftAtrgrHlnl+J8l34twtYSxyghi1X+iH5Qy\nGg9qJN9h3mE0y77gJc4gr7YFg+kOafwHW5r/Q+NpKazgo/FL4br1cGYFDNYh7yYL\n6jLbqsxCTSLo3VFta5kbZkPr/l/b9JFK8mlBAoGAP1LhOtRDpH/iZQ8z7JoOKYsm\n1ZnIpMHIpUwpX4kMbrK85RROXDBdPjIImLEEr3AxB3TrGS6jfDOCeDwevAli+7fa\nFmRUoqCwZm3I6t7rsbrrAzaf4PG0kPNMUkHNQcSjjZHmILYvY7i+lKn+UBGMilad\n0cDqX0wptOZb2TFamHE=\n-----END PRIVATE KEY-----\n",
                                client_email: "dmst-service@demyst-379323.iam.gserviceaccount.com",
                                scopes: ["https://www.googleapis.com/auth/spreadsheets"],
                            };

                            gapi.auth.setToken(await GetAccessTokenFromServiceAccount.do(object))
                            gapi.client.init({
                                discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
                            }).then(() => {
                                ths.init_new_artist()
                            })

                            
                        }

                        


                    })

                })

            })
        })
    }

}
</script>