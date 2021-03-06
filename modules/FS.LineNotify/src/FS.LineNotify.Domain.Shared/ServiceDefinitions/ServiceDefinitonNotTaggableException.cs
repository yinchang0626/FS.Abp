﻿using Microsoft.Extensions.Logging;
using System;
using Volo.Abp;

namespace FS.LineNotify.ServiceDefinitions
{
    [Serializable]
    public class ServiceDefinitonNotTaggableException : BusinessException
    {
        public ServiceDefinitonNotTaggableException(
            string code = null,
            string message = null,
            string details = null,
            Exception innerException = null,
            LogLevel logLevel = LogLevel.Warning) 
            : base(code, message, details, innerException, logLevel)
        {
        }

        public ServiceDefinitonNotTaggableException(string no) 
        {
            //Code = CmsKitErrorCodes.Tags.EntityNotTaggable;
            //WithData(nameof(Tag.EntityType), no);
        }
    }
}
