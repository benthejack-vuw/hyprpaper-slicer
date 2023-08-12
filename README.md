# stretch an image over multiple monitors with hyprland/hyprpaper

you can use this to crop a big image to span over multiple monitors.

test with big-ol-fella.jpg, it's just a lazy midjourney image blown up with gigapixel.

## Dependencies
- hyprland
- hyprpaper
- nodejs
- imagemagick

## Usage
```
    node ./hyprpaper-span.js [optional: args] [image]

    --apply
    // don't just create the images, apply them using hyprpaper

    --rm
    // delete the images after you've applied them to the screen

    --monitors="{result of hyprctl monitors -j}"
    // if you don't supply this it'll just run "hyprctl monitors -j"
    // if you aren't using hyprland I guess you can craft this yourself..

    --outputPath=/absolute/path
    // probably needs to be an absolute path. defaults to current directory

    --offsets='{"x":[0-1], "y":[0-1]}'
    // offsets='{"x":0.5, "y":0.5}' will center the image (monitors in offsets.json currently does nothing)

    --verbose
```

examples

```
    node ./hyprpaper-span.js ./big-ol-fella.jpg --apply --rm
    
    node ./hyprpaper-span.js ./big-ol-fella.jpg --apply --outputPath=/home/me/Wallpapers/bigOlFella

    node ./hyprpaper-span.js ./big-ol-fella.jpg --apply --offsets='{"x": 0.5, "y": 0.5}'

    node ./hyprpaper-span.js ./big-ol-fella.jpg --apply --offsets=$(cat offsets.json | jq -c)
```



apply will apply the wallpapers