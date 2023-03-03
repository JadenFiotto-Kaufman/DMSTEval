<template>
    <div>
        <b-container v-if="!done" fluid style="margin-top:20px">
            <b-row class="text-center"><b-col><h5>Please review these works of art from {{ current_artist }}</h5></b-col></b-row>
            <b-row align-h="center">
                <b-col style="margin-top:20px" cols="auto" v-for="image in example_images">
                    <b-img  v-b-popover.hover="{html:true, content:'<img style=\'height:512px;width:512px\' src=\'' + image + '\'></img>'}" :src="image" :height="256" :width="256"></b-img>
                </b-col>
            </b-row>
            <hr style=" border-top: 10px solid rgba(0, 0, 0, 1.0);">
            <b-row style="margin-top:20px">
                <b-col>
                    <b-row style="justify-content: center;"><h6>{{ study_images.length }} cases left. {{ Object.keys(this.images).length }} artists to go</h6></b-row>
                    <b-row style="justify-content: center;">
                        <b-img :src="study_image" :height="512" :width="512">
                        </b-img>
                    </b-row>
                    <b-row style="justify-content: center;">
                        <p style="font-size:120%;">How confident are you that this image is from {{ current_artist }}? <br> (1 being least
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
            <b-row style="justify-content: center;"><b-button style="width:90px; height:60px; margin-top: 30px; margin-bottom: 50px;"
                    @click="submit_rating" variant="primary">Next</b-button></b-row>

        </b-container>
        <div v-if="done" style="width:100vw; height:100vh; background-image: url('gj.jpg')"></div>
    </div>
</template>
<script>

import axios from 'axios'
import fs from '../assets/fs.json'

let sheets_path = 'https://api.apispreadsheets.com/data/lyJ97n9V3CjwX24y/'
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
            case_numer:1,
            id: this.CreateUUID()
        }
    },
    methods: {

        submit_rating() {

            if (this.rating != null) {
                let value_body = { "uuid": this.id, "artist": this.current_artist, "image": this.study_image, "rating": this.rating }

                axios.post(sheets_path, value_body).then((response) => {
                    console.log(response)
                })
                    .catch((error) => {
                        console.error(error)
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

            if (artist_names.length > 0){

                this.current_artist = artist_names[this.getRandomInt(artist_names.length)]

                this.images[this.current_artist]['real_artist'] = this.shuffle(this.images[this.current_artist]['real_artist'])
                this.example_images = this.images[this.current_artist]['real_artist'].slice(0, 5)

                this.images[this.current_artist]['real_artist'].splice(0, 5)

                console.log(Object.keys(this.images[this.current_artist]))

                this.study_images = []

                let SLD_from = []
                let SDNG_from = []

                for (const type_key in this.images[this.current_artist]) {
                    if (type_key.startsWith('SLD_from')){
                        SLD_from.push(...this.images[this.current_artist][type_key])
                    }
                    else if (type_key.startsWith('SDNG_from')){
                        SDNG_from.push(...this.images[this.current_artist][type_key])
                    }
                    else if (type_key.startsWith('from')){

                        continue
                    }
                    else{
                        this.study_images.push(...this.shuffle(this.images[this.current_artist][type_key]).slice(0, 5))
                    }
                }

                this.study_images.push(...this.shuffle(SLD_from).slice(0, 20))
                this.study_images.push(...this.shuffle(SDNG_from).slice(0, 20))

                this.study_images = this.shuffle(this.study_images)

                delete this.images[this.current_artist]

                this.next_image()

            }

            else{
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

        this.init_new_artist()

    }

}
</script>