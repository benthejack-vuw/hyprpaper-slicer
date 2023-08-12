# stretch an image over multiple monitors with hyprland/hyprpaper

you can use this to crop a big image to span over multiple monitors.
test with big-ol-fella.jpg, it's just a lazy midjourney image blown up with gigapixel.

install nodejs if you don't already have it.

```
    node ./hyprpaper-span.js [optional: args] [image]
    --apply (apply the crops now)
    --rm (you've used --apply and you don't want to keep the cropped images knocking about)
    --monitors="json - result of hyprctl monitors -j" - defaults to running "hyprctl monitors -j"
    --outputPath="output path for cropped images" - defaults to .
    --offsets="json offsets x and y between 0 and 1 (monitors in the example is currenty unused) 0.5 will center the image"
    --verbose
    [optional: monitors json] [optional: cropped images output path]
```

eg..
```
    node ./hyprpaper-span.js ./big-ol-fella.jpg --apply --rm
    
    node ./hyprpaper-span.js ./big-ol-fella.jpg --apply --outputPath=/home/me/Wallpapers/bigOlFella

    node ./hyprpaper-span.js ./big-ol-fella.jpg --apply --offsets=$(cat offsets.json | jq -c)
```



apply will apply the wallpapers