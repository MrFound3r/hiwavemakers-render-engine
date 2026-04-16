# Remotion Render Configuration Guide

## English

This project supports **two rendering quality modes**:

- **CRF mode**: better when you want more consistent quality control
- **Bitrate mode**: required when using hardware acceleration

You must use **only one mode at a time**.

### 1. Main environment variables

Add or update these values in your `.env` file:

```env
VIDEO_RENDER_AUDIO_CODEC=aac
VIDEO_RENDER_VIDEO_CODEC=h264
VIDEO_RENDER_CONCURRENCY=5
VIDEO_RENDER_TIMEOUT_MS=30000
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_JPEG_QUALITY=95
VIDEO_RENDER_CRF=18
VIDEO_RENDER_BITRATE=3000k
VIDEO_RENDER_COLOR_SPACE=bt709
VIDEO_RENDER_QUALITY_MODE=crf
```

---

### 2. Choose one render mode

#### Option A: CRF mode
Use this when you want better quality control and are **not** using hardware acceleration.

```env
VIDEO_RENDER_QUALITY_MODE=crf
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_CRF=18
```

Notes:
- `VIDEO_RENDER_BITRATE` can stay in the file, but it will be ignored in CRF mode.
- Good default: `VIDEO_RENDER_CRF=18`

---

#### Option B: Bitrate mode
Use this when you want to use hardware acceleration or explicitly control bitrate.

```env
VIDEO_RENDER_QUALITY_MODE=bitrate
VIDEO_RENDER_HARDWARE_ACCELERATION=if-possible
VIDEO_RENDER_BITRATE=3000k
```

Notes:
- `VIDEO_RENDER_CRF` can stay in the file, but it will be ignored in bitrate mode.
- Increase bitrate if video quality looks too compressed.

---

### 3. Image format recommendation

Recommended default:

```env
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

Use `png` when you want better preservation of light textures and cleaner frame rendering.

If you switch to JPEG:

```env
VIDEO_RENDER_IMAGE_FORMAT=jpeg
VIDEO_RENDER_JPEG_QUALITY=95
```

---

### 4. Important rules

- Do **not** use `VIDEO_RENDER_QUALITY_MODE=crf` together with hardware acceleration enabled
- Do **not** try to pass both CRF and bitrate at the same time
- `VIDEO_RENDER_JPEG_QUALITY` only matters when `VIDEO_RENDER_IMAGE_FORMAT=jpeg`

---

### 5. Quick setup examples

#### Quality-first setup
```env
VIDEO_RENDER_QUALITY_MODE=crf
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_CRF=18
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

#### Faster setup
```env
VIDEO_RENDER_QUALITY_MODE=bitrate
VIDEO_RENDER_HARDWARE_ACCELERATION=if-possible
VIDEO_RENDER_BITRATE=3000k
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

---

### 6. If you get this error

```txt
"crf" and "videoBitrate" can not both be set. Choose one of either.
```

Check:
- `VIDEO_RENDER_QUALITY_MODE`
- `VIDEO_RENDER_HARDWARE_ACCELERATION`

Most likely fixes:
- set `VIDEO_RENDER_QUALITY_MODE=crf` and `VIDEO_RENDER_HARDWARE_ACCELERATION=disabled`
- or set `VIDEO_RENDER_QUALITY_MODE=bitrate`

---

## Español

Este proyecto soporta **dos modos de calidad de render**:

- **Modo CRF**: mejor cuando quieres un control de calidad más consistente
- **Modo Bitrate**: necesario cuando usas aceleración por hardware

Debes usar **solo un modo a la vez**.

### 1. Variables principales de entorno

Agrega o actualiza estos valores en tu archivo `.env`:

```env
VIDEO_RENDER_AUDIO_CODEC=aac
VIDEO_RENDER_VIDEO_CODEC=h264
VIDEO_RENDER_CONCURRENCY=5
VIDEO_RENDER_TIMEOUT_MS=30000
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_JPEG_QUALITY=95
VIDEO_RENDER_CRF=18
VIDEO_RENDER_BITRATE=3000k
VIDEO_RENDER_COLOR_SPACE=bt709
VIDEO_RENDER_QUALITY_MODE=crf
```

---

### 2. Elige un modo de render

#### Opción A: modo CRF
Úsalo cuando quieras mejor control de calidad y **no** estés usando aceleración por hardware.

```env
VIDEO_RENDER_QUALITY_MODE=crf
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_CRF=18
```

Notas:
- `VIDEO_RENDER_BITRATE` puede quedarse en el archivo, pero será ignorado en modo CRF.
- Buen valor por defecto: `VIDEO_RENDER_CRF=18`

---

#### Opción B: modo Bitrate
Úsalo cuando quieras usar aceleración por hardware o controlar el bitrate de forma explícita.

```env
VIDEO_RENDER_QUALITY_MODE=bitrate
VIDEO_RENDER_HARDWARE_ACCELERATION=if-possible
VIDEO_RENDER_BITRATE=3000k
```

Notas:
- `VIDEO_RENDER_CRF` puede quedarse en el archivo, pero será ignorado en modo bitrate.
- Sube el bitrate si el video se ve demasiado comprimido.

---

### 3. Recomendación para formato de imagen

Valor recomendado:

```env
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

Usa `png` cuando quieras conservar mejor texturas claras y un render de frames más limpio.

Si cambias a JPEG:

```env
VIDEO_RENDER_IMAGE_FORMAT=jpeg
VIDEO_RENDER_JPEG_QUALITY=95
```

---

### 4. Reglas importantes

- No uses `VIDEO_RENDER_QUALITY_MODE=crf` junto con aceleración por hardware habilitada
- No intentes pasar CRF y bitrate al mismo tiempo
- `VIDEO_RENDER_JPEG_QUALITY` solo importa cuando `VIDEO_RENDER_IMAGE_FORMAT=jpeg`

---

### 5. Ejemplos rápidos de configuración

#### Configuración enfocada en calidad
```env
VIDEO_RENDER_QUALITY_MODE=crf
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_CRF=18
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

#### Configuración más rápida
```env
VIDEO_RENDER_QUALITY_MODE=bitrate
VIDEO_RENDER_HARDWARE_ACCELERATION=if-possible
VIDEO_RENDER_BITRATE=3000k
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

---

### 6. Si aparece este error

```txt
"crf" and "videoBitrate" can not both be set. Choose one of either.
```

Revisa:
- `VIDEO_RENDER_QUALITY_MODE`
- `VIDEO_RENDER_HARDWARE_ACCELERATION`

Soluciones más comunes:
- poner `VIDEO_RENDER_QUALITY_MODE=crf` y `VIDEO_RENDER_HARDWARE_ACCELERATION=disabled`
- o usar `VIDEO_RENDER_QUALITY_MODE=bitrate`